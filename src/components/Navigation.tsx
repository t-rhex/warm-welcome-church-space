
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="font-display text-2xl text-church-800">
            Grace Church
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-church-600 hover:text-church-800 transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-church-600 hover:text-church-800 transition-colors">
              About
            </Link>
            <Link to="/events" className="text-church-600 hover:text-church-800 transition-colors">
              Events
            </Link>
            <Link to="/give" className="text-church-600 hover:text-church-800 transition-colors">
              Give
            </Link>
            <Link to="/contact" className="text-church-600 hover:text-church-800 transition-colors">
              Contact
            </Link>
          </div>
          <button className="md:hidden text-church-600 hover:text-church-800">
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
