import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  FileText,
  RefreshCw,
  BarChart3,
  House,
  FileStack,
  CalendarHeartIcon,
  ClipboardPenLine,
} from "lucide-react";
import { NavLink } from "../reusable/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Logo from "@/assets/apple-touch-icon.png";
import { useAuth } from "../../context/AuthContext";

// Admin navigation items
const adminNavigationItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Clients", url: "/admin/clients", icon: UserPlus },
  { title: "Templates", url: "/admin/templates", icon: FileText },
  { title: "Sync", url: "/admin/sync", icon: RefreshCw },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "Compliance Types", url: "/admin/compliance-types", icon: ClipboardPenLine },
  { title: "Compliance Calendar", url: "/admin/compliance-calendar", icon: CalendarHeartIcon },
];

// Client navigation items
const clientNavigationItems = [
  { title: "Dashboard", url: "/client/dashboard", icon: House },
  { title: "MIS Reports", url: "/client/mis-report", icon: FileStack },
  { title: "Compliance Calendar", url: "/client/compliance-calendar", icon: CalendarHeartIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems = user?.role === "admin" ? adminNavigationItems : clientNavigationItems;

  // Fallback user for demo purposes if auth not set up yet
  const currentUser = user ?? { name: "Admin User", email: "admin@infomatrix.com" };

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };


  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="Logo" className="w-1/4 rounded-lg object-contain" />
          <span className="font-bold text-2xl">InfoMatrix</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="py-6">Navigations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-4 py-5"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(currentUser.name || "Nirvaaha")}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(currentUser.name || "Nirvaaha")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-sidebar-foreground truncate">
                {currentUser.name || "Nirvaaha"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {currentUser.email || "nirvaaha@infomatrix.com"}
              </span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
