
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { House, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Profile = () => {
    const { user, logout } = useAuth();
    
    if (!user) return <div className="p-10 text-center">Loading...</div>;

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
    <div className="max-w-4xl mx-auto space-y-6 mt-2">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <House width={20} className="text-black dark:text-white" />
            <BreadcrumbLink asChild>
              <a href="/admin/dashboard" className="font-medium">
                Dashboard
              </a>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              {/* @ts-ignore */}
              <a href="/admin/profile" className="font-medium">
                Profile
              </a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-2 flex justify-between items-center">
        <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          Profile
        </h2>
        <p className="text-muted-foreground">
          View your personal information and account details.
        </p>
        </div>
        <Button variant="destructive" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>

       <div className="flex gap-6 flex-col md:flex-row">
           {/* Profile Card */}
           <Card className="md:w-1/3 h-fit">
                <CardHeader className="flex flex-col items-center">
                    <Avatar className="h-24 w-24">
                       
                           <AvatarFallback className="text-4xl font-bold" style={{
                  backgroundColor: getColorForName(user.name || "Nirvaaha"),
                  color: "white",
                }}>
                  {getInitials(user.name || "Nirvaaha")}
                </AvatarFallback>
                    </Avatar>
                    <CardTitle className="mt-4 text-center leading-5">{user.name || "Nirvaaha"}</CardTitle>
                    <CardDescription className="capitalize badge bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{user.role}</CardDescription>
                </CardHeader>
           </Card>

           {/* Details Form */}
           <div className="md:w-2/3 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Your basic account details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" defaultValue={user.name || "Nirvaaha"} placeholder="Your Name" disabled /> 
                             {/* Keep name disabled or enabled? User said "can't change email and password". 
                                Usually profile names can be changed but without backend support, keeping disabled/readonly is safer to avoid confusion.
                                I will mark it as readOnly for now or disabled to match the request style.
                             */}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                             {/* Constraint: "cant change email" */}
                            <Input id="email" defaultValue={user.email || "Nirvaaha@infomatrix.com"} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" defaultValue={user.role} className="capitalize" disabled />
                        </div>
                    </CardContent>
                </Card>
           </div>
       </div>
    </div>
  );
};

export default Profile;