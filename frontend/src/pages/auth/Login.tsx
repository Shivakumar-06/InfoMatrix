import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import logo from "../../assets/apple-touch-icon.png";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { CheckCircle, X, Send } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle Submit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);

      const user = JSON.parse(localStorage.getItem("user")!);

      toast.success("Login successful!", {
        duration: 3000,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        position: "bottom-right",
      });

      // Navigate based on role

      if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/client/dashboard", {});
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Something went wrong";

      setError(message);
      if (message.toLowerCase().includes("not found")) {
        toast.error("Client not found!", {
          description: "Please check your email and try again.",
          duration: 3000,
          icon: <X className="w-5 h-5 text-red-500" />,
          position: "top-right",
        });
      } else if (
        message.toLowerCase().includes("invalid password") ||
        message.toLowerCase().includes("wrong password")
      ) {
        toast.error("Incorrect password!", {
          description: "Please recheck your password.",
          duration: 3000,
          icon: <X className="w-5 h-5 text-red-500" />,
          position: "top-right",
        });
      } else {
        toast.error("Login failed!", {
          description: message,
          duration: 3000,
          icon: <X className="w-5 h-5 text-red-500" />,
          position: "top-right",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] p-4">
      <Card className="w-full max-w-[480px] border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center space-y-4 pt-10 pb-2">
          <div className="w-full flex justify-center items-center gap-2 mb-2">
            <img src={logo} className="h-16 w-auto object-contain" alt="Logo" />
            <span className="font-bold text-2xl">InfoMatrix</span>
          </div>
          
          <div className="text-center space-y-2 px-4">
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Sign In With Your Zohobooks Email Address And Password To Access The Professional MIS Dashboard
            </p>
            {/* Keeping the logic of password login but style matching the text somewhat */}
          </div>
        </CardHeader>

        <CardContent className="pt-6 px-8 pb-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="bg-gray-50/50 border-gray-200 focus:bg-white transition-colors h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-gray-50/50 border-gray-200 focus:bg-white transition-colors h-11"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                <p className="text-red-600 text-center text-sm font-medium">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-[#751A1F] hover:bg-[#5e1519] text-white h-11 text-[15px] font-medium mt-2"
              disabled={loading}
            >
              {loading ? (
                "Logging in..." 
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
