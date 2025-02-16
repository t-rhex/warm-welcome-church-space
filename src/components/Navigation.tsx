
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="font-display text-2xl text-church-800">
            Grace Church
          </Link>
          
          {/* Desktop Navigation */}
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

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-church-600 hover:text-church-800 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md absolute left-0 right-0 top-20 p-4 shadow-lg">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-church-600 hover:text-church-800 transition-colors py-2">
                Home
              </Link>
              <Link to="/about" className="text-church-600 hover:text-church-800 transition-colors py-2">
                About
              </Link>
              <Link to="/events" className="text-church-600 hover:text-church-800 transition-colors py-2">
                Events
              </Link>
              <Link to="/give" className="text-church-600 hover:text-church-800 transition-colors py-2">
                Give
              </Link>
              <Link to="/contact" className="text-church-600 hover:text-church-800 transition-colors py-2">
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
