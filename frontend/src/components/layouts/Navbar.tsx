import { LogOut, User, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";


export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []);

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

  const getFirstTwoWords = (name: string) => {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)          // ← take only first 2 words
    .join(" ");
};

  const getColorForName = (name: string) => {
    const colors = [
      "#F44336", // red
      "#E91E63", // pink
      "#9C27B0", // purple
      "#3F51B5", // indigo
      "#03A9F4", // light blue
      "#009688", // teal
      "#4CAF50", // green
      "#FF9800", // orange
      "#795548", // brown
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };


  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-9 w-9" />
        <h1 className="text-lg font-semibold text-foreground">InfoMatrix</h1>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="hidden items-center gap-2 font-normal md:flex">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Badge>


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback style={{
                  backgroundColor: getColorForName(user?.name || "Nirvaaha"),
                  color: "white",
                }}>
                  {getInitials(user?.name || "Nirvaaha")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 bg-popover mt-4" align="end" forceMount>
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback style={{
                  backgroundColor: getColorForName(user?.name || "Nirvaaha"),
                  color: "white",
                }}>
                  {getInitials(user?.name || "Nirvaaha")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium text-popover-foreground">
                  {getFirstTwoWords(user?.name || "Nirvaaha")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || "nirvaaha@infomatrix.com"}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate(user?.role === 'admin' ? "/admin/profile" : "/client/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
