import { Loader2Icon } from "lucide-react";

interface Probs { 
    title: string;
    description: string;

};

export const LoadingState = ({ title, description }: Probs) => { // must pass title and description when using this component
    return (
        <div className="py-4 px-8 flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
                <Loader2Icon className="animate-spin h-10 w-10 text-cyan-700" />
                <div className="flex flex-col gap-y-2 text-center">
                    <h6 className="text-lg font-medium">{title}</h6>
                    <p className="text-sm">{description}</p>
                </div>
            </div>
        </div>
    );
}