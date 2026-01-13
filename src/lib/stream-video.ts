import "server-only"; // as an extra security import server only to prevent this page from being imported in the client side

import { StreamClient } from "@stream-io/node-sdk"

export const streamVideo = new StreamClient(
    //pass the api keys
    process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
    process.env.STREAM_VIDEO_SECRET_KEY!,
);
