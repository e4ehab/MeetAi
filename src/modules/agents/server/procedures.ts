import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter, ProtectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { agentsInsertSchema, agentsUpdateSchema } from "../schemas";
import { z } from "zod";
import { eq, getTableColumns, sql, and, ilike, desc, count } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";

// agentsRouter → contains all API functions for agents
export const agentsRouter = createTRPCRouter({

    update: ProtectedProcedure.input(agentsUpdateSchema).mutation(async ({ input, ctx }) => {
        const [updatedAgent] = await db
            .update(agents)
            .set(input)
            .where(
                and(
                    eq(agents.id, input.id),
                    eq(agents.userId, ctx.auth.user.id),
                )
            )
            .returning();
        if (!updatedAgent) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Agent Not Found!" });
        }
        return updatedAgent;

    }),

    remove: ProtectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
        const [removeAgent] = await db.delete(agents).where(
            and(
                eq(agents.id, input.id),//match the agent id with the input id
                eq(agents.userId, ctx.auth.user.id), //match the user id with the current logged-in user 
            ),
        )
            .returning();
        if (!removeAgent) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Agent Not Found!" });
        }
        return removeAgent;
    }),

    getOne: ProtectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
        const [existingAgent] = await db
            .select({
                meetingCount: sql<number>`5`,
                ...getTableColumns(agents),
            })
            .from(agents)
            .where(
                and(
                    eq(agents.id, input.id),// the first one is to enusre that we are loading the agent for the id we pass in the input
                    eq(agents.userId, ctx.auth.user.id), //the second one ensure that the agent id is the same one as context.auth.user.id (confirm that the user has the access to see that user id)
                )
            );
        if (!existingAgent) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Agent Not Found!" })
        }


        return existingAgent;
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
                search: z.string().nullish() //default value of search is null
            })
        )
        .query(async ({ ctx, input }) => { //baseProcedure.query() → means this is a GET-like request
            const { search, page, pageSize } = input;
            /*------------------------------------------------------------------------*/
            const data = await db
                .select(
                    {
                        meetingCount: sql<number>`6`,
                        ...getTableColumns(agents),
                    }
                )
                .from(agents) // select all from agents table
                .where(
                    and(
                        eq(agents.userId, ctx.auth.user.id),
                        search ? ilike(agents.name, `%${search}%`) : undefined,
                    )
                )
                .orderBy(desc(agents.createdAt), desc(agents.id))
                .limit(pageSize)
                .offset((page - 1) * pageSize)

            /*------------------------------------------------------------------------*/

            const [total] = await db
                .select({ count: count() })
                .from(agents)
                .where(
                    and(
                        eq(agents.userId, ctx.auth.user.id),
                        search ? ilike(agents.name, `%${search}%`) : undefined,
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

    create: ProtectedProcedure // if the user is not loggedin this will cause the procedure to fail
        .input(agentsInsertSchema) //if the user forget to add (name/instructions) to the agent this will cause the procedure to fail
        .mutation(async ({ input, ctx }) => {
            // ProtectedProcedure = route requires authentication
            // tRPC checks that ctx.auth.user exists
            // input(agentsInsertSchema)   → You validate the body using Zod schema.
            // mutation()    → This is a POST-like request (writes data).
            const [createdAgent] = await db.insert(agents).values({
                ...input,
                userId: ctx.auth.user.id,
            }).returning();
            /*
                  input contains the form fields validated by Zod.
                 You spread the input fields into the insert call.
                  You add userId from the user session (ctx.auth.user.id).
                 .returning() gives you the inserted row back.
                 You destructure [createAgent] because Drizzle returns an array.
                 ✔ Finally returns the created agent.
            */
            return createdAgent;
        }),

});
