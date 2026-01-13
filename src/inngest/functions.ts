import { StreamTranscriptItem } from "@/modules/meetings/types";
import { inngest } from "./client";
import JSONL from "jsonl-parse-stringify"
import { db } from "@/db";
import { agents, user, meetings } from "@/db/schema"
import { inArray, eq } from "drizzle-orm";
import { createAgent, openai, TextMessage } from "@inngest/agent-kit"

// if you went to http://localhost:8288/ you will find this function added 

/*
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);
*/

const summarizer = createAgent({
  name: "summarizer",
  system: `You are an expert summarizer. You write readable, concise, simple content. You are given a transcript of a meeting and you need to summarize it.

Use the following markdown structure for every output:

### Overview
Provide a detailed, engaging summary of the session's content. Focus on major features, user workflows, and any key takeaways. Write in a narrative style, using full sentences. Highlight unique or powerful aspects of the product, platform, or discussion.

### Notes
Break down key content into thematic sections with timestamp ranges. Each section should summarize key points, actions, or demos in bullet format.

Example:
#### Section Name
- Main point or demo shown here
- Another key insight or interaction
- Follow-up tool or explanation provided

#### Next Section
- Feature X automatically does Y
- Mention of integration with Z`.trim(),
  model: openai({ model: "gpt-4o", apiKey: process.env.OPENAI_API_KEY }),
});

export const meetingsProcessing = inngest.createFunction(
  { id: "meetings/processing" },
  { event: "meetings/processing" },

  async ({ event, step }) => {
    //destrucuring the event adnd the steps, and inside we aaare going to define the steps we need for meeting processing

    /* first step - fetch event data transcriptUrl */
    const response = await step.run("fetch-transcript", async () => {
      return fetch(event.data.transcriptUrl).then((res) => res.text());
    });

    /* second step - parse JSONL into structured array */
    const transcript = await step.run("parse-transcript", async () => {
      return JSONL.parse<StreamTranscriptItem>(response);
    });

    /* third step - fetching all users and agents referenced in the transcript by their IDs but doesn’t yet attach them, effectively collecting speaker data for later use.- */
    const transcriptWithSpeakers = await step.run("add-speakers", async () => {
      const speakerIds = [
        ...new Set(transcript.map((item) => item.speaker_id)),
      ];

      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds))
        .then((users) =>
          users.map((user) => ({
            ...user,
          }))
        );

      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((agents) =>
          agents.map((agent) => ({
            ...agent,
          }))
        );

      /* forth step merging users and agents, then for each transcript item attaches the speaker’s name if found, otherwise labels the speaker as "unknown". to tell who was speaking at that time */
      const speakers = [...userSpeakers, ...agentSpeakers]; // join the speakers

      return transcript.map((item) => {
        const speaker = speakers.find((speaker) => speaker.id === item.speaker_id);
        if (!speaker) {
          return {
            ...item,
            user: {
              name: "unknown"
            },
          };
        }

        return {
          ...item,
          user: {
            name: speaker.name,
          },
        };

      });

    });

    /* forth step - sumarizing the transcript with openAi */
    const { output } = await summarizer.run(
      "Summarize the following transcript: " +
      JSON.stringify(transcriptWithSpeakers)
    );

    /* fifth step - saving the generated meeting summary to the database and marks the meeting as completed. */
    await step.run("save-summary", async () => {
      await db
        .update(meetings)
        .set({
          summary: (output[0] as TextMessage).content as string,
          status: "completed",
        })
        .where(eq(meetings.id, event.data.meetingId));
    });


  },
);