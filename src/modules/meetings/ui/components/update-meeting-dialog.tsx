import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingForm } from "./meeting-form";
import { MeetingGetOne } from "../../types";


interface UpdateMeetingDialogProbs {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValues: MeetingGetOne
};
/*
open:	        "Is it open right now?"
onOpenChange:	"If the open/close state changes, tell me."
*/
export const UpdateMeetingDialog = ({ open, onOpenChange, initialValues }: UpdateMeetingDialogProbs) => {

    return (
        <ResponsiveDialog
            title="Edit Meeting"
            description="Edit the meeting details"
            open={open}
            onOpenChange={onOpenChange}
        >
            <MeetingForm
                onSuccess={() => onOpenChange(false)}

                onCancel={() => onOpenChange(false)}

                initialValues={initialValues}
            />
        </ResponsiveDialog>
    )

}