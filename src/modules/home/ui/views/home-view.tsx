"use client";
/*
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const HomeView = () => {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    // to check if user is logged in or not -> if we have session means user is logged in
    if (!session) {
        return (
            <p>loading ...</p>
        )
    }


    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Welcome, {session.user.name}!</h1>
            <Button className="mt-4" onClick={() => authClient.signOut(
                {
                    fetchOptions: {
                        onSuccess: () => router.push("/sign-in"),
                    }
                }
            )} > Sign Out </Button>
        </div>
    )
}

export const HomeView = () => {
    const trpc = useTRPC(); // add trpc hooh from TRPC client (to get access to trpc client)
    const { data } = useQuery(trpc.hello.queryOptions({ text: "ehab" })); // Fetches data using React Query + tRPC
    return (
        <div className="p-4">
            {data?.greeting}
        </div>
    )
}
*/

export const HomeView = () => {
    return (
        <div>
            Home View
        </div>
    );
}