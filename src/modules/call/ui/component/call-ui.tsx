
import { useState } from "react";
import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Probs {
    meetingName: string;
};

export const CallUi = ({ meetingName }: Probs) => {
    const call = useCall();

    //we will use hooks to get the current state of the call
    const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby"); // default is "lobby"

    const handleJoin = async () => {
        if (!call) return;
        await call.join();
        setShow("call");
    }

    const handleLeave = async () => {
        if (!call) return;
        call.endCall();
        setShow("ended");
    }

    return (
        <StreamTheme className="h-full">
            {show === "lobby" && <CallLobby onJoin={handleJoin} />}
            {show === "call" && <CallActive meetingName={meetingName} onLeave={handleLeave}/>}
            {show === "ended" && <CallEnded />}
        </StreamTheme>
    )
}