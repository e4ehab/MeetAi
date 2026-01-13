import { MeetingGetOne } from "../../types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { meetingsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";

interface MeetingFormProbs {
    onSuccess?: (id?: string) => void; // allow accepting optional id of string
    onCancel?: () => void;
    initialValues?: MeetingGetOne;
};

export const MeetingForm = ({
    onSuccess,
    onCancel,
    initialValues,

}: MeetingFormProbs) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [openFirstAgentDialog, setOpenFirstAgentDialog] = useState(false);
    const [agentSearch, setAgentSearch] = useState("");
    const agents = useQuery(trpc.agents.getMany.queryOptions({ pageSize: 100, search: agentSearch }),);

    const createMeeting = useMutation(
        trpc.meetings.create.mutationOptions({
            onSuccess: async (data) => { // when we successfully create the meeting we will invaildate the. getMany
                await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}),);

                // TODO: invalidate free tier usage
                onSuccess?.(data.id);
            },
            onError: (error) => {
                toast.error(error.message);

                //TODO : check if error code is "forbidden" redirect to /upgrade
            },
        })
    );

    const updateMeeting = useMutation(
        trpc.meetings.update.mutationOptions({
            onSuccess: async () => { // when we successfully update the meeting we will invaildate the. getMany
                await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}),);

                if (initialValues?.id) {
                    await queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id: initialValues.id }),)
                }
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message);

                //TODO : check if error code is "forbidden" redirect to /upgrade
            },
        })
    );

    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        resolver: zodResolver(meetingsInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            agentId: initialValues?.agentId ?? "",
        }
    })

    const isEdit = !!initialValues?.id;
    const isPending = createMeeting.isPending || updateMeeting.isPending;

    const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
        if (isEdit) {
            //console.log("TODO : Update Meeting")
            updateMeeting.mutate({ id: initialValues.id, ...values });
        }
        else {
            createMeeting.mutate(values);
        }
    };

    return (
        <>
            <NewAgentDialog open={openFirstAgentDialog} onOpenChange={setOpenFirstAgentDialog} />
            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>

                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g German consultations" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="agentId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agent</FormLabel>
                                <FormControl>
                                    <CommandSelect
                                        options={(agents.data?.items ?? []).map((agent) => ({
                                            id: agent.id,
                                            value: agent.id,
                                            children: (
                                                <div className="flex items-center gap-x-2">
                                                    <GeneratedAvatar
                                                        seed={agent.name}
                                                        variant="botttsNeutral"
                                                        classname="border size-6"
                                                    />
                                                    <span>{agent.name}</span>
                                                </div>
                                            )
                                        }))}
                                        onSelect={(value) => field.onChange(value)}
                                        onSearch={(value) => setAgentSearch(value)}
                                        value={field.value}
                                        placeholder="Select an agent"
                                    />

                                </FormControl>

                                <FormDescription>
                                    Not found what you're looking for?{" "}
                                    <button type="button" className=" hover:underline text-green-700" onClick={() => setOpenFirstAgentDialog(true)}>
                                        Create new agent
                                    </button>
                                </FormDescription>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-between gap-x-2">
                        {onCancel && (
                            <Button
                                variant="ghost"
                                disabled={isPending}
                                type="button" //this is important so this button will not act like a submit as it is inside the form
                                onClick={() => onCancel()}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button disabled={isPending} type="submit">
                            {isEdit ? "Update" : "Create"}
                        </Button>
                    </div>

                </form>
            </Form>
        </>
    );

}