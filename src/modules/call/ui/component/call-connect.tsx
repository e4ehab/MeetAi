"use client";

import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Call, CallingState, StreamCall, StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css"
import { CallUi } from "./call-ui";

interface Props {
    meetingId: string;
    meetingName: string;
    userId: string;
    userName: string;
    userImage: string;
}

export const CallConnect = ({ meetingId, meetingName, userId, userName, userImage }: Props) => {
    const trpc = useTRPC();
    const { mutateAsync: generateToken } = useMutation(
        trpc.meetings.generateToken.mutationOptions(),
    );

    const [client, setClient] = useState<StreamVideoClient>(); //type of StreamVideoClient
    useEffect(() => {
        //one-lined sum -> This effect creates a video client once, stores it in state, and safely disconnects it when the component is destroyed.
        /*
         1: Create the client
            .Initializes the Stream Video SDK
            .Authenticates the user
            .Prepares video infrastructure
        */
        const _client = new StreamVideoClient({
            apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
            user: {
                id: userId,
                name: userName,
                image: userImage,
            },
            tokenProvider: generateToken,
        });

        /*
         2: Save the state
            .set client to the newly created client
            .At this point -> Client is connected UI can render video components
        */
        setClient(_client);

        /*
           3: The cleanup function (VERY IMPORTANT)
        */
        return () => {
            _client.disconnectUser();
            setClient(undefined);
        };

    }, [userId, userName, userImage]); //Effect will re-run when any dependency changes,causing disconnection

    const [call, setCall] = useState<Call>();
    useEffect(() => {
        if (!client) return; // cannot initialize the call if there is no client
        const _call = client.call("default", meetingId) // type of call is default, the idntifier is meetingId
        _call.camera.disable(); // by default disaple the camera
        _call.microphone.disable(); // by default disaple the microphone
        setCall(_call);

        return () => {
            //cleaning function will disconnect the call under conditions
            if (_call.state.callingState !== CallingState.LEFT) {
                _call.leave();
                _call.endCall();
                setCall(undefined);
            }
        };
    }, [client, meetingId])

    // Check at this point if we dont't have a client / call
    if (!client || !call) {
        return (
            <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent to-sidebar">
                <LoaderIcon className="size-6 animate-spin text-white" />
            </div>
        );
    }


    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <CallUi meetingName={meetingName} />
            </StreamCall>
        </StreamVideo>
    )
}