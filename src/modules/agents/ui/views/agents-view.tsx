"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { DataPagination } from "../components/data-pagination"
import { useRouter } from "next/navigation";

// usequery has is loading because it fetches data on mount and needs to show loading state
// useSuspenseQuery → has already data no need to add  isloading state from react-query

/*
const MockData: Payment [] = [// mockdata with the tpe of " payment "
    {
        id: "871236",
        amount: 100,
        status: "pending",
        email: "e138@gmail.com"
    },
]
*/

export const AgentsViewLoading = () => {
    return (
        <LoadingState
            title=" Loading Agents"
            description="this may take a few seconds"
        />
    )
}

export const AgentsViewError = () => {
    return (
        <ErrorState
            title="Error Loading Agents"
            description="Something went wrong"
        />
    );
}

export const AgentsView = () => {
    const router = useRouter();
    const [filters, setFilters] = useAgentsFilters();
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions({
        ...filters,
        /* 
         search: filters.search,      -> no need to do that we can simply spread the filters and it has the search option by default
        */
    }));
    //const { data } = useQuery(trpc.agents.getMany.queryOptions());


    return (
        <div className="flex-1 pd-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable
                data={data.items}
                columns={columns}
                onRowClick={(row) => router.push(`/agents/${row.id}`)} //now we can access the  agent when click on the agent in the table
            />
            <DataPagination
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters({ page })} //function accepts the page and update it to the new page
            />
            {/*{JSON.stringify(data, null, 2)} /*  2 -> make it pretty print and readble in two lines */}
            {data.items.length === 0 && (<EmptyState title="Create your first Agent" description="Create an agent to join your meeting. Each agent will follow you instructions and interact with participants during the call." />)}
        </div>
    );
}

