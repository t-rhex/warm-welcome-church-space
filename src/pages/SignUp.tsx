import Navigation from "@/components/Navigation";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Link } from "react-router-dom";

const SignUp = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        <div className="container max-w-lg mx-auto">
          <SignUpForm />
          <p className="text-center mt-6 text-church-600">
            Already have an account?{" "}
            <Link to="/signin" className="text-church-800 hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;