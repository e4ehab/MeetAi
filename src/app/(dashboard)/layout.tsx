// layout for dashboard pages
//we created this layout to add a sidebar here and we dont want it active all time so we didnot create it in the global layout file
//we want it acive for routes inside dashboard folder
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar"
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar"
interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
    return (
        <SidebarProvider>
            <DashboardSidebar />
            <main className="flex flex-col h-screen w-screen bg-muted">
                <DashboardNavbar /> 
                {children}
            </main>
        </SidebarProvider>
    );
}

export default Layout;
