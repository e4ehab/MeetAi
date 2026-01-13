import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AgentForm } from "./agents-form";

interface NewAgentDialogProbs {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};
/*
open:	        "Is it open right now?"
onOpenChange:	"If the open/close state changes, tell me."
*/
export const NewAgentDialog = ({ open, onOpenChange, }: NewAgentDialogProbs) => {
    return (
        <ResponsiveDialog
            title="New Agent"
            description="Create new agent"
            open={open}
            onOpenChange={onOpenChange}
        >
            <AgentForm
                onSuccess={() => onOpenChange(false)}
                onCancel={() => onOpenChange(false)}
            />
        </ResponsiveDialog>
    )

}