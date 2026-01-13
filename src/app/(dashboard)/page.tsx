//server side
import { auth } from "@/lib/auth";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const page = async () => {
  //use server component to render client component
  const session = await auth.api.getSession({
    headers: await headers(),
    // get headers to check cookies for session
  });
  if (!session) {
    redirect("/sign-in");
  }

  return <HomeView />;
}
export default page;