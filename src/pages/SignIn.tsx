import Navigation from "@/components/Navigation";
import { SignInForm } from "@/components/auth/SignInForm";
import { Link } from "react-router-dom";

const SignIn = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        <div className="container max-w-lg mx-auto">
          <SignInForm />
          <p className="text-center mt-6 text-church-600">
            Have an invitation?{" "}
            <Link to="/signup" className="text-church-800 hover:underline font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;