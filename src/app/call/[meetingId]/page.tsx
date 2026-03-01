// we have created this page outside the dashboard and the sidebar as we want the call to be full screen
// why meetingId ? --> because in our meetings procedure when we use create method , when creating new call we use the createdMeeting.id as the unique identifier for the call

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { CallView } from "@/modules/call/ui/views/call-view";

interface Probs {
    params: Promise<{
        meetingId: string;
    }>;
};

const Page = async ({ params }: Probs) => {
    // async because the params of a type of promise so we have to await for it
    const { meetingId } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(
        trpc.meetings.getOne.queryOptions({ id: meetingId }),
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CallView meetingId={meetingId} />
        </HydrationBoundary>
    );
};

export default Page;