import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const Page = async () => {
    //This is a server component in Next.js 13+ (because it is async and doesn’t use "use client").It runs on the server before rendering the page.
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    //✔️ This calls your auth API to check if there is an existing session (logged-in user).
    //✔️ It sends the request headers (cookies) so the backend can verify the session.

    if (!!session) {
        redirect("/");
    }
    //✔️ If a session exists (user is logged in), it redirects them to the home page ("/").
    return (
        <SignInView /> // Render the sign-in form view which is a client component, and client components can handle user interactions like form submissions.
    );
    //✔️ If no session exists (user is not logged in), it renders the SignInView component, which displays the sign-in form.
}
export default Page;
//✔️ Lets Next.js use this as the page for /sign-in or wherever you placed it.

/*
    Why this is useful?
✔️ Prevents logged-in users from accessing /login again
✔️ Improves user experience
✔️ Uses Next.js server components for secure session checking
*/