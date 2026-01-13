import { db } from "@/db";
import { meetings, agents } from "@/db/schema";
import { createTRPCRouter, ProtectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, getTableColumns, and, ilike, desc, count, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schemas";
import { MeetingStatus } from "../types";
import { streamVideo } from "@/lib/stream-video";
import { generateAvatarUri } from "@/lib/avatar";

// meetingsRouter → contains all API functions for meetings
export const meetingsRouter = createTRPCRouter({

    generateToken: ProtectedProcedure.mutation(async ({ ctx }) => {
        // 1.prepare the user for the call
        await streamVideo.upsertUsers([
            { // pass the values
                id: ctx.auth.user.id,
                name: ctx.auth.user.name,
                role: "admin",
                image: ctx.auth.user.image ?? generateAvatarUri({ seed: ctx.auth.user.name, variant: "initials" })
            },
        ]);

        // 2.create the actual token
        const expirationTime = Math.floor(Date.now() / 1000) + 3600; //eqv = 1 hour
        const issuedAt = Math.floor(Date.now() / 1000) - 60;

        const token = streamVideo.generateUserToken({
            // pass the values
            user_id: ctx.auth.user.id,
            exp: expirationTime,
            validity_in_seconds: issuedAt,
        });

        return token;
    }),

    remove: ProtectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
        const [removeMeeting] = await db
            .delete(meetings)
            .where(
                and(//we are looking for matching meetingID and meeting userID
                    eq(meetings.id, input.id),
                    eq(meetings.userId, ctx.auth.user.id),
                )
            )
            .returning();
        if (!removeMeeting) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Meeting Not Found!" });
        }
        return removeMeeting;
    }),

    update: ProtectedProcedure.input(meetingsUpdateSchema).mutation(async ({ input, ctx }) => {
        const [updatedMeeting] = await db
            .update(meetings)
            .set(input)
            .where(
                and(//we are looking for matching meetingID and meeting userID
                    eq(meetings.id, input.id),
                    eq(meetings.userId, ctx.auth.user.id),
                )
            )
            .returning();
        if (!updatedMeeting) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Meeting Not Found!" });
        }
        return updatedMeeting;

    }),

    create: ProtectedProcedure // if the user is not loggedin this will cause the procedure to fail
        .input(meetingsInsertSchema) //if the user forget to add (name/instructions) to the agent this will cause the procedure to fail
        .mutation(async ({ input, ctx }) => {
            // ProtectedProcedure = route requires authentication
            // tRPC checks that ctx.auth.user exists
            // input(meetingsInsertSchema)   → You validate the body using Zod schema.
            // mutation()    → This is a POST-like request (writes data).
            const [createdMeeting] = await db.insert(meetings).values({
                ...input,
                userId: ctx.auth.user.id,
            }).returning();
            /*
                  input contains the form fields validated by Zod.
                 You spread the input fields into the insert call.
                  You add userId from the user session (ctx.auth.user.id).
                 .returning() gives you the inserted row back.
                 You destructure [createdMeeting] because Drizzle returns an array.
                 ✔ Finally returns the created meeting.
            */

            // Create stream call, Upsert stream users
            /* Upsert is a database command (a blend of UPdate and InSERT) that either inserts a new record if it doesn't exist or updates an existing one if it does */
            const call = streamVideo.video.call("default", createdMeeting.id);
            await call.create({
                data: {
                    created_by_id: ctx.auth.user.id,
                    custom: {
                        meetingId: createdMeeting.id,
                        meetingName: createdMeeting.name,
                    },
                    settings_override: {
                        transcription: {
                            language: "en",
                            mode: "auto-on",
                            closed_caption_mode: "auto-on",
                        },
                        recording: {
                            mode: "auto-on",
                            quality: "1080p",
                        },
                    },
                },
            });


            // fetch an existing agent that this newly created meeting uses
            const [existingAgent] = await db
                .select()
                .from(agents)
                .where(eq(agents.id, createdMeeting.agentId));

            if (!existingAgent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent not found",
                });
            }

            // finally upsert the user 
            await streamVideo.upsertUsers([
                {
                    id: existingAgent.id,
                    name: existingAgent.name,
                    role: "user",
                    image: generateAvatarUri({
                        seed: existingAgent.name,
                        variant: "botttsNeutral",
                    })
                }
            ]);

            return createdMeeting;
        }),

    getOne: ProtectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
        const [existingMeeting] = await db
            .select({
                ...getTableColumns(meetings), //We select all columns from the meetings table, and keep the door open to add more fields later if needed.
                agent: agents, // include all columns from agents
                duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"), //get an interval and convert it to seconds
            })
            .from(meetings)
            .innerJoin(agents, eq(agents.id, meetings.agentId)) // Links each meeting to its assigned agent
            .where(
                and(
                    eq(meetings.id, input.id),// the first one is to enusre that we are loading the agent for the id we pass in the input
                    eq(meetings.userId, ctx.auth.user.id), //the second one ensure that the agent id is the same one as context.auth.user.id (confirm that the user has the access to see that user id)
                )
            );
        if (!existingMeeting) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Meeting Not Found!" })
        }


        return existingMeeting;
    }),

    getMany: ProtectedProcedure
        .input(
            z.object({
                page: z.number().default(DEFAULT_PAGE),
                pageSize: z
                    .number()
                    .min(MIN_PAGE_SIZE)
                    .max(MAX_PAGE_SIZE)
                    .default(DEFAULT_PAGE_SIZE), //default value of pg size
                search: z.string().nullish(), //default value of search is null
                agentId: z.string().nullish(), //filter by agentId
                status: z.enum([MeetingStatus.Active, MeetingStatus.Upcoming, MeetingStatus.Completed, MeetingStatus.Processing, MeetingStatus.Cancelled]).nullish(), //filter by status
            })
        )
        .query(async ({ ctx, input }) => { //baseProcedure.query() → means this is a GET-like request
            const { search, page, pageSize, agentId, status } = input;
            /*------------------------------------------------------------------------*/
            const data = await db
                .select(
                    {
                        ...getTableColumns(meetings), // select all from meeting where...
                        agent: agents, // include all columns from agents
                        duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"), //get an interval and convert it to seconds
                    }
                )
                .from(meetings) // select all from meetings table
                .innerJoin(agents, eq(agents.id, meetings.agentId)) // Links each meeting to its assigned agent
                .where(
                    and(
                        eq(meetings.userId, ctx.auth.user.id), // Ensures the user only sees their own meetings
                        search ? ilike(meetings.name, `%${search}%`) : undefined,
                        status ? eq(meetings.status, status) : undefined, // check if we have status
                        agentId ? eq(meetings.agentId, agentId) : undefined, // check if we have agentId
                    )
                )
                .orderBy(desc(meetings.createdAt), desc(meetings.id))
                .limit(pageSize)
                .offset((page - 1) * pageSize)

            /*------------------------------------------------------------------------*/
            const [total] = await db
                .select({ count: count() })
                .from(meetings)
                .innerJoin(agents, eq(agents.id, meetings.agentId))
                .where(
                    and(
                        eq(meetings.userId, ctx.auth.user.id),
                        search ? ilike(meetings.name, `%${search}%`) : undefined,
                        status ? eq(meetings.status, status) : undefined, // check if we have status
                        agentId ? eq(meetings.agentId, agentId) : undefined, // check if we have agentId
                    )
                );
            /*------------------------------------------------------------------------*/
            const totalPages = Math.ceil(total.count / pageSize)
            /*------------------------------------------------------------------------*/
            return {
                items: data,
                total: total.count,
                totalPages,
            };
        }),
});
