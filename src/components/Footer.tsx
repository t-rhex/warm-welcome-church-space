import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const Footer = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    }
  };

  return (
    <footer className="bg-church-800 text-white py-16">
      <div className="container mx-auto px-4">
        {/* Newsletter Signup */}
        <div className="max-w-xl mx-auto text-center mb-16">
          <h3 className="font-display text-2xl mb-4">Stay Connected</h3>
          <p className="text-church-200 mb-6">
            Subscribe to our newsletter for updates, events, and spiritual insights.
          </p>
          <NewsletterSignup />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 border-t border-church-700 pt-16">
          {/* About Section */}
          <div>
            <h3 className="font-display text-2xl mb-4">Revival Center</h3>
            <p className="text-church-200 mb-6">
              We are a church that believes in Jesus & loves God and people. A multi-cultural and multi-generational church committed to reaching the city of Woodbury and Beyond.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-church-200 hover:text-white">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-church-200 hover:text-white">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-church-200 hover:text-white">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xl mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/ministries" className="text-church-200 hover:text-white">
                  Ministries
                </Link>
              </li>
              <li>
                <Link to="/prayer-request" className="text-church-200 hover:text-white">
                  Prayer Requests
                </Link>
              </li>
              <li>
                <Link to="/staff" className="text-church-200 hover:text-white">
                  Our Staff
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-church-200 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-church-200 hover:text-white">
                  Events Calendar
                </Link>
              </li>
              <li>
                {user ? (
                  <button 
                    onClick={handleSignOut}
                    className="text-church-200 hover:text-white"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link to="/signin" className="text-church-200 hover:text-white">
                    Sign In
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="font-display text-xl mb-4">Service Times</h4>
            <ul className="space-y-2 text-church-200">
              <li>Sunday: 9:00 AM & 11:00 AM</li>
              <li>Wednesday: 7:00 PM</li>
              <li>Youth Group: Friday 6:30 PM</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-xl mb-4">Contact Us</h4>
            <ul className="space-y-4 text-church-200">
              <li>Contact information coming soon</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-church-700 mt-12 pt-8 text-center text-church-300">
          <p>&copy; {new Date().getFullYear()} Revival Center. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;