"use client";

import { useTRPC } from "@/trpc/client"
import { useRouter } from "next/navigation";
import { useSuspenseQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { MeetingIdViewHeader } from "../components/meeting-id-view-header";
import { useConfirm } from "@/hooks/use-confirm";
import { useState } from "react";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import { UpcomingState } from "../components/upcoming-state";
import { ActiveState } from "../components/active-state";
import { CancelledState } from "../components/cancelled-state";
import { ProcessingState } from "../components/processing-state";
import { CompletedState } from "../components/completed-state";

interface Probs {
    meetingId: string
}

export const MeetingIdViewLoading = () => {
    return (
        <LoadingState
            title=" Loading Meeting"
            description="this may take a few seconds"
        />
    )
}

export const MeetingIdViewError = () => {
    return (
        <ErrorState
            title="Error Loading Meeting"
            description="Something went wrong"
        />
    );
}




export const MeetingIdView = ({ meetingId }: Probs) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }),); //matching the server component

    const removeMeeting = useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
                // TODO:invalidate free tier usage
                router.push("/meetings"); //after the remove get back
            },
        }),
    );

    const [RemoveConfirmation, confirmRemove] = useConfirm( //Hook
        "Are you sure? ",
        "The following action will remove this meeting.",
    );

    const handleRemoveMeeting = async () => {
        const ok = await confirmRemove();

        if (!ok) return;

        await removeMeeting.mutateAsync({ id: meetingId });
    };

    const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

    const isActive = data.status === "active";
    const isUpcoming = data.status === "upcoming";
    const isCancelled = data.status === "cancelled";
    const isCompleted = data.status === "completed";
    const isProcessing = data.status === "processing";


    return (
        <>
            <RemoveConfirmation />
            <UpdateMeetingDialog
                open={updateMeetingDialogOpen}
                onOpenChange={setUpdateMeetingDialogOpen}
                initialValues={data}
            />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <MeetingIdViewHeader
                    meetingId={meetingId}
                    meetingName={data.name}
                    onEdit={() => setUpdateMeetingDialogOpen(true)}
                    onRemove={handleRemoveMeeting}
                />
                {/*{JSON.stringify(data, null, 2)}*/}
                {isCancelled && <CancelledState />}
                {isProcessing && <ProcessingState />}
                {isCompleted && (<CompletedState data={data} />)}
                {isActive && (<ActiveState meetingId={meetingId} />)}
                {isUpcoming && (<UpcomingState meetingId={meetingId} onCancelMeeting={() => { }} isCancelling={false} />)}
            </div>
        </>
    );

};