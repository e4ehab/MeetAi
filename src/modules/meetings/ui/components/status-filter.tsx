import { CommandSelect } from "@/components/command-select";
import { CircleXIcon, CircleCheckIcon, ClockArrowUpIcon, VideoIcon, LoaderIcon } from "lucide-react";
import { MeetingStatus } from "../../types";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

const options = [
    {
        id: MeetingStatus.Upcoming,
        value: MeetingStatus.Upcoming,
        children: (
            <div className="flex items-center gap-x-2 capitalize">
                <ClockArrowUpIcon className="size-4 text-yellow-500" />
                Upcoming
            </div>
        ),
    },
    {
        id: MeetingStatus.Active,
        value: MeetingStatus.Active,
        children: (
            <div className="flex items-center gap-x-2 capitalize">
                <VideoIcon className="size-4 text-green-500" />
                Active
            </div>
        ),
    },
    {
        id: MeetingStatus.Completed,
        value: MeetingStatus.Completed,
        children: (
            <div className="flex items-center gap-x-2 capitalize">
                <CircleCheckIcon className="size-4 text-blue-500" />
                Completed
            </div>
        ),
    },
    {
        id: MeetingStatus.Cancelled,
        value: MeetingStatus.Cancelled,
        children: (
            <div className="flex items-center gap-x-2 capitalize">
                <CircleXIcon className="size-4 text-red-500" />
                Canceled
            </div>
        ),
    }, 
    {
        id: MeetingStatus.Processing,
        value: MeetingStatus.Processing,
        children: (
            <div className="flex items-center gap-x-2 capitalize">
                <LoaderIcon className="size-4 text-purple-500" />
                Processing
            </div>
        ),
    },
];

export const MeetingsStatusFilter = () => {
    const [filters, setFilters] = useMeetingsFilters();

    return (
        <CommandSelect
            options={options}
            placeholder="Status"
            onSelect={(value) => setFilters({ status: value as MeetingStatus })} //grab the selected value and set it to the url using nuqs
            className="w-[150px] bg-white"
            value={filters.status ?? ""} //if no status is selected, set it to empty string
        />
    );
};
