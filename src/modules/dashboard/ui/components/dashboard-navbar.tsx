"use client"
import { Button } from "@/components/ui/button";
import { PanelLeftIcon, PanelLeftCloseIcon, SearchIcon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { DashboardCommand } from "./dashboard-command";
import { useEffect, useState } from "react";

export const DashboardNavbar = () => {
    const { toggleSidebar, state, isMobile } = useSidebar(); //we can access sidebar state, toggle function and isMobile flag here
    // toggleSidebar function will be used to open/close sidebar 
    const [commandOpen, setCommandOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            setCommandOpen((open) => !open);
        }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
    }, []);
    // import the shortcuts

    return (
        <>
            <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
            <nav className="flex px-4 gap-x-2 items-center py-3 border-b bg-background">
                <Button className="size-9" variant="outline" onClick={toggleSidebar} >
                    {/*if the state of the sidebar is collapsed or we are using mobile phone change the icon from PanelLeftIcon -> PanelLeftCloseIcon*/}
                    {(state === "collapsed" || isMobile)
                        ? <PanelLeftIcon className="w-5 h-5" />
                        : <PanelLeftCloseIcon className="w-5 h-5 rotate-180" />
                    }
                </Button>

                {/* search button */}
                <Button className="h-9 w-60 justify-start font-normal text-muted-foreground hover:text-muted-foreground"
                    variant="outline"
                    size="sm"
                    onClick={() => setCommandOpen((open) => !open)} >
                    <SearchIcon /> Search...
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">{/*short cuts to open the search bar*/}
                        <span className="text-xs">&#8984;</span>k
                    </kbd>
                </Button>
            </nav>
        </>
    );
};