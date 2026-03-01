import { AgentGetOne } from "../../types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { agentsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AgentFormProbs {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialValues?: AgentGetOne;
};

export const AgentForm = ({
    onSuccess,
    onCancel,
    initialValues,

}: AgentFormProbs) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const createAgent = useMutation(
        trpc.agents.create.mutationOptions({
            onSuccess: async () => { // when we successfully create the agent we will invaildate the. getMany
                await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}),);

                // TODO: invalidate free tier usage
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message);

                //TODO : check if error code is "forbidden" redirect to /upgrade
            },
        })
    );

    const updateAgent = useMutation(
        trpc.agents.update.mutationOptions({
            onSuccess: async () => { // when we successfully update the agent we will invaildate the. getMany
                await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}),);

                if (initialValues?.id) {
                    await queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({ id: initialValues.id }),)
                }
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message);

                //TODO : check if error code is "forbidden" redirect to /upgrade
            },
        })
    );

    const form = useForm<z.infer<typeof agentsInsertSchema>>({
        resolver: zodResolver(agentsInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            instructions: initialValues?.instructions ?? "",
        }
    })

    const isEdit = !!initialValues?.id;
    const isPending = createAgent.isPending || updateAgent.isPending;

    const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
        if (isEdit) {
            //console.log("TODO : Update Agent")
            updateAgent.mutate({ id: initialValues.id, ...values });
        } 
        else {
            createAgent.mutate(values);
        }
    };

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <GeneratedAvatar
                    seed={form.watch("name")}
                    variant="botttsNeutral"
                    classname="border size-16"
                />

                <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. German Tutor" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="instructions"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>instructions</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="e.g. you are herlpful germman teacher , helping people learn German language" />
                            </FormControl>
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
    );

}