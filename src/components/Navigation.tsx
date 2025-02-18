import { Link, useLocation } from "react-router-dom";
import { ChevronDown, X, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [nextStreamDate, setNextStreamDate] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState("");
  const location = useLocation();
  const { user } = useAuth();

  // Check if we're currently live
  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        // Get current date in ISO format
        const now = new Date().toISOString();

        // Check for any active streams
        const { data: activeStreams, error } = await supabase
          .from('live_streams')
          .select('*')
          .eq('status', 'live')
          .lte('start_time', now)
          .gte('end_time', now)
          .maybeSingle();

        if (error) throw error;
        setIsLive(!!activeStreams);

        // If not live, get next scheduled stream
        if (!activeStreams) {
          const { data: nextStream, error: nextError } = await supabase
            .from('live_streams')
            .select('*')
            .eq('status', 'scheduled')
            .gt('start_time', now)
            .order('start_time', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (nextError) throw nextError;
          if (nextStream) {
            setNextStreamDate(new Date(nextStream.start_time));
          } else {
            setNextStreamDate(null);
          }
        }
      } catch (error) {
        console.error('Error checking live status:', error);
      }
    };

    // Check initially and every minute
    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!nextStreamDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = nextStreamDate.getTime() - now;

      if (distance < 0) {
        setCountdown("");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      let countdownText = "";
      if (days > 0) countdownText += `${days}d `;
      if (hours > 0) countdownText += `${hours}h `;
      countdownText += `${minutes}m`;

      setCountdown(countdownText);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [nextStreamDate]);

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
    <nav className={`fixed top-[var(--banner-height)] left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="font-display text-xl md:text-2xl text-church-800">
            <div className="flex items-center gap-2">
              Revival Center
              {isLive && (
                <Link to="/live">
                  <Badge variant="destructive" className="animate-pulse">
                    LIVE
                  </Badge>
                </Link>
              )}
              {!isLive && countdown && (
                <Badge variant="outline" className="text-xs">
                  Next Stream: {countdown}
                </Badge>
              )}
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 relative">
            {/* Primary Navigation */}
            <Link to="/plan-visit" className="text-church-600 hover:text-church-800 transition-colors">
              Plan Your Visit
            </Link>
            <Link to="/connect" className="text-church-600 hover:text-church-800 transition-colors">
              Connect
            </Link>
            <div className="relative group/watch">
              <div className="flex items-center gap-1 text-church-600 hover:text-church-800 transition-colors cursor-pointer">
                <span>Watch</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover/watch:rotate-180" />
              </div>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible opacity-0 group-hover/watch:visible group-hover/watch:opacity-100 transition-all duration-200 z-50">
                <Link to="/live" className="block px-4 py-2 text-church-600 hover:bg-gray-50 transition-colors">
                  Live Stream
                </Link>
                <Link to="/sermons" className="block px-4 py-2 text-church-600 hover:bg-gray-50 transition-colors">
                  Sermons
                </Link>
              </div>
            </div>
            <Link to="/prayer-wall" className="text-church-600 hover:text-church-800 transition-colors">
              Prayer Wall
            </Link>
            <Link to="/fundraising" className="text-church-600 hover:text-church-800 transition-colors">
              Fundraising
            </Link>
            <Button asChild className="bg-church-600 hover:bg-church-700 text-white">
              <Link to="/give">
              Give
              </Link>
            </Button>
            <div className="relative group/more">
              <div className="flex items-center gap-1 text-church-600 hover:text-church-800 transition-colors cursor-pointer">
                <span>More</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover/more:rotate-180" />
              </div>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible opacity-0 group-hover/more:visible group-hover/more:opacity-100 transition-all duration-200 z-50">
                <Link to="/blog" className="block px-4 py-2 text-church-600 hover:bg-gray-50 transition-colors">
              News
                </Link>
                <Link to="/announcements" className="block px-4 py-2 text-church-600 hover:bg-gray-50 transition-colors">
                  Announcements
                </Link>
                <Link to="/resources" className="block px-4 py-2 text-church-600 hover:bg-gray-50 transition-colors">
                  Resources
                </Link>
                <Link to="/ministries" className="block px-4 py-2 text-church-600 hover:bg-gray-50 transition-colors">
                  Ministries
                </Link>
                <Link to="/about" className="block px-4 py-2 text-church-600 hover:bg-gray-50 transition-colors">
                  About
                </Link>
                <Link to="/contact" className="block px-4 py-2 text-church-600 hover:bg-gray-50 transition-colors">
                  Contact
                </Link>
              </div>
            </div>
            {user && (
              <Link 
                to="/dashboard" 
                className="text-church-600 hover:text-church-800 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden fixed inset-0 top-[calc(5rem+var(--banner-height))] bg-white overflow-y-auto transition-all duration-300",
          isMenuOpen ? "opacity-100 z-[90]" : "opacity-0 -z-10"
        )}>
            <div className="flex flex-col divide-y divide-gray-100 p-4">
              {/* Primary Navigation */}
              <div className="py-4 space-y-2">
              <Link 
                to="/plan-visit" 
                className="flex items-center gap-2 text-church-600 hover:text-church-800 transition-colors p-3 rounded-lg hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Plan Your Visit
              </Link>
              <Link 
                to="/connect" 
                className="flex items-center gap-2 text-church-600 hover:text-church-800 transition-colors p-3 rounded-lg hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Connect
              </Link>
              {/* Watch Section */}
              <div className="space-y-2">
                <div className="font-medium text-sm text-gray-500 p-3">Watch</div>
                <Link 
                  to="/live" 
                  className="flex items-center gap-2 text-church-600 hover:text-church-800 p-3 pl-6 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Live Stream
                </Link>
                <Link 
                  to="/sermons" 
                  className="flex items-center gap-2 text-church-600 hover:text-church-800 p-3 pl-6 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sermons
                </Link>
              </div>
              <Link 
                to="/prayer-wall" 
                className="flex items-center gap-2 text-church-600 hover:text-church-800 transition-colors p-3 rounded-lg hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Prayer Wall
              </Link>
              <Link 
                to="/fundraising" 
                className="flex items-center gap-2 text-church-600 hover:text-church-800 transition-colors p-3 rounded-lg hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Fundraising
              </Link>
              <Button 
                asChild 
                className="w-full bg-church-600 hover:bg-church-700 text-white mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
              <Link to="/give" className="flex items-center gap-2">
                Give
              </Link>
              </Button>
              </div>
              
              {/* Secondary Navigation */}
              <div className="py-4 space-y-2">
                <div className="font-medium text-sm text-gray-500 p-3">More</div>
                <Link 
                  to="/blog" 
                  className="flex items-center gap-2 text-church-600 hover:text-church-800 p-3 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  News
                </Link>
                <Link 
                  to="/announcements" 
                  className="flex items-center gap-2 text-church-600 hover:text-church-800 p-3 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Announcements
                </Link>
                <Link 
                  to="/resources" 
                  className="flex items-center gap-2 text-church-600 hover:text-church-800 p-3 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Resources
                </Link>
                <Link 
                  to="/ministries" 
                  className="flex items-center gap-2 text-church-600 hover:text-church-800 p-3 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ministries
                </Link>
                <Link 
                  to="/about" 
                  className="flex items-center gap-2 text-church-600 hover:text-church-800 p-3 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className="flex items-center gap-2 text-church-600 hover:text-church-800 p-3 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                {user && (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 text-church-600 hover:text-church-800 p-3 rounded-lg hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;