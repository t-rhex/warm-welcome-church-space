import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log the error more quietly
    console.info("404: Route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-4">
        <div className="container mx-auto max-w-md text-center">
          <span className="inline-block text-church-400 text-9xl font-display mb-8">404</span>
          <p className="text-xl text-church-600 mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Button 
            asChild 
            className="bg-church-600 hover:bg-church-700 gap-2"
          >
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
