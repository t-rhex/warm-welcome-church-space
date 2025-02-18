import { Link } from "react-router-dom";
import { Bell, Home, LogOut, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthProvider";

type DashboardHeaderProps = {
  onToggleSidebar: () => void;
  onSignOut: () => void;
};

const DashboardHeader = ({ onToggleSidebar, onSignOut }: DashboardHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="fixed top-[var(--banner-height)] left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <span className="font-display text-xl hidden md:inline">Revival Center</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center gap-4 justify-end">
          <div className="hidden md:flex relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-church-500" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden md:inline">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={onSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;