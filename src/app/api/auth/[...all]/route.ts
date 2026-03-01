//we are registering our auth client her to post and get route for our local host 3000 and whatever comes after it
import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);