"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {FaGithub, FaGoogle} from "react-icons/fa"; //import icons for github and google

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, { message: "Password is required" }),
});

export const SignInView = () => {
    const router = useRouter(); // use router to push/redirect after sign in without refreshing the page
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        //create onsupmit function which accepts data of the type inferred from formSchema (email and password)
        setError(null); //reset error state
        setPending(true);//set pending to true while we wait for response

        //extract the error from the response
        authClient.signIn.email(
            {
                email: data.email,
                password: data.password,
                callbackURL: "/",
            },
            {
                onSuccess: () => {
                    setPending(false);
                    router.push("/"); //redirect to home page after successful sign in
                },
                onError: ({ error }) => {
                    setError(error.message);
                }
            }
        );

    };

    const onSocial = (provider: "github" | "google") => {
        // create onSocial function which accepts provider of type github or google and calls authClient.signIn.social with the provider
        setError(null); //reset error state
        setPending(true);//set pending to true while we wait for response

        //extract the error from the response
        authClient.signIn.social(
            {//pass the provider
                provider: provider,
                callbackURL: "/",
            },
            {
                onSuccess: () => {
                    // no need to redirect here as the page will reload on social sign in
                    setPending(false);
                },
                onError: ({ error }) => {
                    setError(error.message);
                }
            }
        );

    };

    return (
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <Form {...form}> {/*need the entire form props or we will get an error -> {...form}*/}
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">
                                        Welcome back
                                    </h1>
                                    <p className="text-muted-foreground text-balance">
                                        login to your account to continue
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="e@example.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>


                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="********"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {!!error && ( //if error exists, show the alert component
                                    <Alert className="bg-destructive/10 border-none">
                                        <OctagonAlertIcon className="h-4 w-4 text-destructive!" />
                                        <AlertTitle>{error}</AlertTitle>
                                    </Alert>
                                )}
                                <Button disabled={pending} type="submit" className="w-full"> {/* if pending disaple this But-ton */}
                                    Sign In
                                </Button>
                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                                        Or continue with
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button onClick={() => onSocial("google")} disabled={pending} variant="outline" type="button" className="w-full">
                                        <FaGoogle /> Google
                                    </Button>
                                    <Button onClick={() => onSocial("github")} disabled={pending} variant="outline" type="button" className="w-full">
                                        <FaGithub /> Github
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Don&apos;t have an account? <Link href="/sign-up" className="underline underline-offset-4"> Sign up</Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                    <div className="bg-radial from-sidebar-accent to-sidebar relative hidden md:flex flex-col gap-y-4 items-center justify-center">
                        <img
                            src="/logo.svg"
                            alt="Image"
                            className="h-[92-px] w-[92px]"
                        />
                        <p className="text-2xl font-semibold text-white">Meet.AI</p>
                    </div>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#"> Privacy Policy</a>

            </div>
        </div>
    );
}