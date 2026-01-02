import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../../components/ui/sidebar";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { AppSidebar } from "./Sidebar";


interface DashboardLayoutProps {
  children?: React.ReactNode; 
}

export function Layout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <Navbar />
          <main className="flex-1 p-6 bg-background">
            {/* If children are provided (manual wrapper), render them. 
                Otherwise, assume it's a Route layout and render Outlet. */}
            {children || <Outlet />}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}