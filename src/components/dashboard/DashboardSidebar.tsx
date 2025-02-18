import { Link, useLocation } from "react-router-dom";
import {
  PieChart,
  Megaphone,
  Users,
  Calendar,
  MessageSquare,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  BookOpen,
  Bookmark,
  ChevronLeft,
  Heart,
  Mail,
  DollarSign,
  Calculator,
  Video,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MenuItem = {
  path: string;
  icon: React.ElementType;
  label: string;
};

type DashboardSidebarProps = {
  isMobile: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSignOut: () => void;
};

const menuItems: MenuItem[] = [
  { path: "", icon: PieChart, label: "Overview" },
  { path: "live-stream", icon: Video, label: "Live Stream" },
  { path: "announcements", icon: Megaphone, label: "Announcements" },
  { path: "tithe-offering", icon: Calculator, label: "Tithe & Offering" },
  { path: "schedules", icon: Calendar, label: "Schedules" },
  { path: "scriptures", icon: BookOpen, label: "Scriptures" },
  { path: "devotionals", icon: Bookmark, label: "Devotionals" },
  { path: "members", icon: Users, label: "Members" },
  { path: "events", icon: Calendar, label: "Events" },
  { path: "prayer-requests", icon: MessageSquare, label: "Prayer Requests" },
  { path: "connection-cards", icon: ClipboardList, label: "Connection Cards" },
  { path: "donations", icon: Heart, label: "Donations" },
  { path: "contact", icon: Mail, label: "Contact Messages" },
  { path: "fundraising", icon: DollarSign, label: "Fundraising" },
  { path: "meetings", icon: Users, label: "Meetings" },
  { path: "resources", icon: Folder, label: "Resources" },
  { path: "reports", icon: FileText, label: "Reports" },
  { path: "settings", icon: Settings, label: "Settings" },
];

const DashboardSidebar = ({
  isMobile,
  isCollapsed,
  onToggleCollapse,
  onSignOut,
}: DashboardSidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-[calc(3.5rem+var(--banner-height))] z-30 h-[calc(100vh-3.5rem-var(--banner-height))] border-r bg-white md:bg-gray-50/40 transition-all duration-300 ease-in-out overflow-y-auto",
        isMobile
          ? isCollapsed
            ? "-translate-x-full"
            : "w-72 shadow-lg"
          : isCollapsed
          ? "w-16"
          : "w-72"
      )}>
      <div className={cn("flex flex-col h-full", !isCollapsed && "min-w-72")}>
        <div className="flex-1 space-y-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === `/dashboard/${item.path}`;

            const menuItem = (path: string) => (
              <div className="relative">
                <Link
                  to={`/dashboard/${path}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100/60",
                    isActive ? "bg-gray-100 text-gray-900 font-medium" : "",
                    isCollapsed && !isMobile && "justify-center px-0"
                  )}>
                  <Icon className="h-5 w-5 shrink-0" />
                  <span
                    className={cn(
                      "flex-1 whitespace-nowrap",
                      isCollapsed && !isMobile && "hidden"
                    )}>
                    {item.label}
                  </span>
                  {!isMobile && !isCollapsed && (
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
                        isActive && "text-gray-500"
                      )}
                    />
                  )}
                </Link>
              </div>
            );

            return isCollapsed && !isMobile ? (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{menuItem(item.path)}</TooltipTrigger>
                <TooltipContent side="right" className="flex items-center">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.path}>{menuItem(item.path)}</div>
            );
          })}
        </div>

        {!isMobile && (
          <div className="border-t border-gray-200 py-4">
            <button
              onClick={onToggleCollapse}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100/60",
                isCollapsed && !isMobile && "justify-center px-0"
              )}>
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 shrink-0" />
              ) : (
                <ChevronLeft className="h-5 w-5 shrink-0" />
              )}
              <span
                className={cn(
                  "flex-1 whitespace-nowrap",
                  isCollapsed && !isMobile && "hidden"
                )}>
                Collapse Menu
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
