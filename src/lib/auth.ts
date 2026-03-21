import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema"; // must import all your schema to make sure the tables are created and handle supmiting functions for creating user in homepage.tsx etc..

export const auth = betterAuth({

    emailAndPassword: {
        enabled: true,
    },

    database: drizzleAdapter(
        db,
        {
            provider: "pg", // postgres provider
            schema, // your database schema
        }
    ),
});
