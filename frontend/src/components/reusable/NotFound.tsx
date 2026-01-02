import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotFoundVideo from '../../assets/Not found.gif'

const NotFound = () => {
  const navigate = useNavigate();
  const {user} = useAuth();

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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-4">
      <h1 className="text-6xl font-extrabold mb-3">404</h1>
      <h2 className="text-4xl font-bold pb-4">Oops! Page not found</h2>
    
      <Button onClick={handleGoBack}>
        Go Back Home
      </Button>
      <div className="mt-2">
        <img
          src={NotFoundVideo}
          alt="404 Illustration"
          className="w-80 mx-auto"
        />
      </div>
    </div>
  );
};

export default NotFound;
