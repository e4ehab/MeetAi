//this is the first component that loads when we go to /agents
//this server component will prefetch the data and then pass it to the client component AgentsView
//it will hydrate the data using HydrationBoundary from react-query
//so when the agent-views finallay loads it will already have the data prefetched reducing the load time

import { AgentsView, AgentsViewError, AgentsViewLoading } from "@/modules/agents/ui/views/agents-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AgentListHeader } from "@/modules/agents/ui/components/agent-list-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs";
import { loadSearchParams } from "@/modules/agents/params";

interface Props {
    searchParams: Promise<SearchParams>
}

const page = async ({ searchParams }: Props) => {
    const filters = await loadSearchParams(searchParams);

    const queryClient = getQueryClient();
    void queryClient.fetchQuery(trpc.agents.getMany.queryOptions({
        ...filters, //now we are sync the server and client component
    })); 

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    return (
        <>
            <AgentListHeader />
            {/*have the data prefetched and hydrated before rendering the AgentsView component, reducing load time*/}
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<AgentsViewLoading />}  >
                    <ErrorBoundary fallback={<AgentsViewError />}>
                        <AgentsView />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
    );
}
export default page;