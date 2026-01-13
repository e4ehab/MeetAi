"use client"

import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useRouter } from "next/navigation";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { DataPagination } from "@/components/data-pagination";

export const MeetingView = () => {
    const trpc = useTRPC();
    const router = useRouter();
    const [filters, setFilters] = useMeetingsFilters();
    // to make the search filters and meeting view in sync (once searching using specific filter it will reflect in the meeting view and viewing the filtered agents immediately)

    const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({
        ...filters,
        /*
         We spread the filters so each filter becomes a top-level input to the tRPC procedure,
         allowing React Query to refetch correctly and keeping the URL, UI, and backend in sync.

         spread all filters (search, status, agentId, page) as top-level properties of the input object
        */
    }));


    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable
                data={data.items}
                columns={columns}
                onRowClick={(row) => router.push(`/meetings/${row.id}`)}
            />
            <DataPagination
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters({ page })}
            />
            {data.items.length === 0 && (<EmptyState title="Create your first Meeting" description="Schedule a meeting to connect with others. Each meeting lets you collaborate, share ideas, and interact with participants in real time." />)}

        </div>
    );


};

/*
{JSON.stringify(data)}	         |   Render data as text (debugging)
JSON.stringify(data) in fetch	 |   Transmit data


JSON.stringify converts JavaScript data into a JSON string,
which is required for network transmission (e.g., HTTP requests),
but when used inside JSX it is only for displaying the data, not for client–server communication.
*/

export const MeetingsViewLoading = () => {
    return (
        <LoadingState
            title=" Loading Meetings"
            description="this may take a few seconds"
        />
    )
}

export const MeetingsViewError = () => {
    return (
        <ErrorState
            title="Error Loading Meetings"
            description="Something went wrong"
        />
    );
}