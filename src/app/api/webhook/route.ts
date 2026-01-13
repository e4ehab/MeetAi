/*
the following webhook securely listens to Stream Video events, activates meetings,
connects an AI agent when a call starts, and ends the call when someone leaves—while protecting your system and credits.

streamVideo.verifyWebhook(body, signature) ensures:
    ❌ no fake requests
    ❌ no credit draining attacks
*/

import {
    CallEndedEvent,
    CallTranscriptionReadyEvent,
    CallSessionParticipantLeftEvent,
    CallRecordingReadyEvent,
    CallSessionStartedEvent,
} from "@stream-io/node-sdk";

import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agents, meetings, meetingStatus } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import { inngest } from "@/inngest/client";

// we are going to develop a method to verify the signture for who ever is tring to access this webhook, 
// as this is not protected via our auth but the signature

function verifySignatureWithSDK(body: string, signature: string): boolean {
    return streamVideo.verifyWebhook(body, signature);
};

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key");

    if (!signature || !apiKey) {
        return NextResponse.json(
            { error: "missing signature or apiKey" },
            { status: 400 }
        );
    }

    // convert the body to a string
    const body = await req.text();

    // finally the check if the signature matches the string body
    if (!verifySignatureWithSDK(body, signature)) {
        return NextResponse.json({ error: "Invaild Signature" }, { status: 400 });
    }

    // safely converts a JSON string into an object, and returns an error if the JSON is invalid sowe won't work with it.
    let payload: unknown; //unknown means I don’t know data's shape.
    try {
        payload = JSON.parse(body) as Record<string, unknown>;
        //“I expect this parsed object to be a plain object with string keys and unknown values.”
    }
    catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    //Get payload.type safely without crashing if payload is not valid.
    const eventType = (payload as Record<string, unknown>)?.type;

    if (eventType === "call.session_started") {
        const event = payload as CallSessionStartedEvent;
        const meetingId = event.call.custom?.meetingId;

        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
        }

        // find an exiting meeting in our db under certain conditions
        const [existingMeeting] = await db
            .select()
            .from(meetings)
            .where(
                and(
                    eq(meetings.id, meetingId),
                    not(eq(meetings.status, "completed")),
                    not(eq(meetings.status, "active")),
                    not(eq(meetings.status, "cancelled")),
                    not(eq(meetings.status, "processing"))
                )
            );
        if (!existingMeeting) {
            return NextResponse.json({ error: "Meeting Not Found" }, { status: 404 });
        }

        /*
            if the meeting exists update it's status to active ASAP, as we 're going to connect the agent,
            so if this event (session_started) fires multiple times it will connect multiple agents which is not good
            so even if it's fires next time [existingMeeting] this will fail to connect another agent
        */
        await db
            .update(meetings)
            .set({
                status: "active",
                startedAt: new Date(),
            })
            .where(eq(meetings.id, existingMeeting.id))

        // find the existing agent for this meeting
        const [existingAgent] = await db
            .select()
            .from(agents)
            .where(
                eq(agents.id, existingMeeting.agentId)
            )

        if (!existingAgent) {
            return NextResponse.json({ error: "Agent Not Found" }, { status: 404 });
        }

        // finally we can connect the stream video call
        const call = streamVideo.video.call("default", meetingId);
        const realtimeClient = await streamVideo.video.connectOpenAi({
            call,
            openAiApiKey: process.env.OPENAI_API_KEY!,
            agentUserId: existingAgent.id,
        });

        // update the session
        realtimeClient.updateSession({
            instructions: existingAgent.instructions,
        });

    } else if (eventType === "call.session_participant_left") {
        // When someone leaves the call, the server extracts the meeting ID and ends the entire video call, to save credit for video straming usage.
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1];//special way to optain meeting id
        if (!meetingId) {
            return NextResponse.json({ error: "Messing meetingId" }, { status: 400 });
        }
        const call = streamVideo.video.call("default", meetingId);
        await call.end();

    } else if (eventType === "call.session_ended") {//capture ending the call/ ending session and update the status to processing
        const event = payload as CallEndedEvent;
        const meetingId = event.call.custom?.meetingId;
        if (!meetingId) {
            return NextResponse.json({ error: "Messing meetingId" }, { status: 400 });
        }
        await db
            .update(meetings)
            .set({
                status: "processing",
                endedAt: new Date(),
            })
            .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));

    } else if (eventType === "call.transcription_ready") {
        const event = payload as CallTranscriptionReadyEvent;
        const meetingId = event.call_cid.split(":")[1];
        const [updatedMeeting] = await db
            .update(meetings)
            .set({
                transcriptUrl: event.call_transcription.url,
            })
            .where(eq(meetings.id, meetingId))
            .returning();

        if (!updatedMeeting) {
            return NextResponse.json({ error: "Meeting Not Found" }, { status: 404 });
        }
        // TODO : call ingist background job to summarize the transcript ✅ done -> src/inngest/functions.ts
        await inngest.send({
            name: "meetings/processing",
            data: {
                meetingId: updatedMeeting.id,
                transcriptUrl: updatedMeeting.transcriptUrl,
            },
        });

    } else if (eventType === "call.recording_ready") {
        const event = payload as CallRecordingReadyEvent;
        const meetingId = event.call_cid.split(":")[1];

        await db
            .update(meetings)
            .set({
                recordingUrl: event.call_recording.url,
            })
            .where(eq(meetings.id, meetingId))
    }

    return NextResponse.json({ status: "ok" });
}

