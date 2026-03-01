import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { meetingsProcessing } from "@/inngest/functions";
//import { helloWorld } from "@/inngest/functions";

// Create an API that serves zero functions

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // your functions will be passed here later! , reaach http://localhost:8288/ to  find the functions added 
    // helloworld,
    meetingsProcessing,

  ],
});

