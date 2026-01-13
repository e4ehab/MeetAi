import { ReactNode, useState } from "react";
import { ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { CommandEmpty, CommandInput, CommandItem, CommandList, CommandResponsiveDialog, } from "@/components/ui/command";

interface Probs {
    options: Array<{
        id: string;
        value: string;
        children: ReactNode;
    }>;

    onSelect: (value: string) => void;

    onSearch?: (value: string) => void;

    value: string;
    placeholder?: string;
    className?: string;
    isSearchable?: boolean;
};

export const CommandSelect = ({ options, onSelect, onSearch, value, placeholder = "Select an option", className, isSearchable }: Probs) => {

    const [open, setOpen] = useState(false);

    const selectedOption = options.find((option) => option.value === value); //get the option and compare it with the value of the selected option (to find the selected option)

    /*
    .when searchinng in the searching bar to select an agent ,i will appear based on the initials
    .and after closing the search bar the brevious searches remains
    .we want to show all the options again after closing the search bar
    .using thd handleOpenChange function to reset the search value when the dialog is closed
    */

   const handleOpenChange = (open: boolean) => {
    onSearch?.(""); //pass empty string to reset the search
    setOpen(open);
   }

    return (
        <>
            <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(true)}
                className={cn(
                    "h-9 justify-between font-normal px-2",
                    !selectedOption && "text-muted-foreground",
                    className,
                )}
            >
                <div>
                    {selectedOption?.children ?? placeholder}
                </div>
                <ChevronsUpDownIcon />
            </Button>
            <CommandResponsiveDialog
                shouldFilter={!onSearch} //the command select won't use the internal filtering and will use react query search
                open={open}
                onOpenChange={handleOpenChange}
            >
                <CommandInput placeholder="Search..." onValueChange={onSearch} />
                <CommandList>
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">No options found.</span>
                    </CommandEmpty>
                    {options.map((option) => (

                        <CommandItem key={option.id} onSelect={() => {
                            onSelect(option.value);
                            setOpen(false);
                        }}>

                            {option.children}

                        </CommandItem>
                    ))}
                </CommandList>
            </CommandResponsiveDialog>
        </>
    )
}
