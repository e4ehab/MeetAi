import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const AgentIdFilter = () => {
    const trpc = useTRPC();
    const [filters, setFilters] = useMeetingsFilters();
    const [agentSearch, setAgentSearch] = useState("");
    const { data } = useQuery(
        trpc.agents.getMany.queryOptions({
            pageSize: 100, // to maake easier to find the agent using the search and the pagination will not be a problem
            search: agentSearch,
        })
    );

    return (
        <CommandSelect
            options={
                (
                    data?.items ?? []).map((agent) => ({
                        id: agent.id,
                        value: agent.id,
                        children: (
                            <div className="flex items-center gap-x-2">
                                <GeneratedAvatar
                                    seed={agent.name}
                                    classname="size-5 rounded-full bg-muted/50"
                                    variant="botttsNeutral"
                                />
                                {agent.name}
                            </div>
                        )
                    })
                    )
            }
            onSelect={(value) => setFilters({ agentId: value })}
            onSearch={setAgentSearch} // to change the value of the search
            value={filters.agentId ?? ""} //if no agent is selected, pass empty string
            className="h-9"
            placeholder="Agent Filter"
        />
    )
};