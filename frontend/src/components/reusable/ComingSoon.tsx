import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TriangleAlert } from "lucide-react";
import NotFoundVideo from '../../assets/Not found.gif'


const ComingSoon = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (user?.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user?.role === "client") {
      navigate("/client/dashboard");
    } else {
      navigate("/");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="flex items-center justify-center gap-2 mb-4">
        <TriangleAlert height={40} width={40} className="text-red-700 text-2xl"/>
        <h1 className="text-4xl font-extrabold">Oops!</h1>
      </div>
      <h2 className="text-3xl font-bold pb-6">We are in the process of developing...</h2>

      <Button onClick={handleGoBack}>
        Go Back To Dashboard
      </Button>
      <div>
        <img
          src={NotFoundVideo}
          alt="404 Illustration"
          className="w-80 mx-auto"
        />
      </div>
    </div>
  )
}

export default ComingSoon