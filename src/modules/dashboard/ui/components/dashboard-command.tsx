import { CommandResponsiveDialog, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Dispatch, SetStateAction } from "react";

//create props for dashboard command if needed in future
interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export const DashboardCommand = ({ open, setOpen }: Props) => {
    return (
        <CommandResponsiveDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="find a meeting or agent" />
            <CommandList>
                <CommandItem>
                    Test
                </CommandItem>
            </CommandList>
        </CommandResponsiveDialog>
    );
};