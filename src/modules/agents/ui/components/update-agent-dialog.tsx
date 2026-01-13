import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AgentForm } from "./agents-form";
import { AgentGetOne } from "../../types";

interface UpdateAgentDialogProbs {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValues: AgentGetOne
};
/*
open:	        "Is it open right now?"
onOpenChange:	"If the open/close state changes, tell me."
*/
export const UpdateAgentDialog = ({ open, onOpenChange,initialValues }: UpdateAgentDialogProbs) => {
    return (
        <ResponsiveDialog
            title="Edit Agent"
            description="Edit the agent details"
            open={open}
            onOpenChange={onOpenChange}
        >
            <AgentForm
                onSuccess={() => onOpenChange(false)}
                onCancel={() => onOpenChange(false)}
                initialValues={initialValues}
            />
        </ResponsiveDialog>
    )

}