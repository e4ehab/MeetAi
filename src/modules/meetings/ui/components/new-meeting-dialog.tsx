import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingForm } from "./meeting-form";
import { useRouter } from "next/navigation";


interface NewMeetingDialogProbs
 {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};
/*
open:	        "Is it open right now?"
onOpenChange:	"If the open/close state changes, tell me."
*/
export const NewMeetingDialog = ({ open, onOpenChange, }: NewMeetingDialogProbs) => {
    const router = useRouter();

    return (
        <ResponsiveDialog
            title="New Meeting"
            description="Create new meeting"
            open={open}
            onOpenChange={onOpenChange}
        >
            <MeetingForm
                onSuccess={(id) => {
                    onOpenChange(false);
                    router.push(`/meetings/${id}`);
                }}
                onCancel={() => onOpenChange(false)}
            />
        </ResponsiveDialog>
    )

}