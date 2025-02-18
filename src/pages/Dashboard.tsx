import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import Overview from "@/components/dashboard/Overview";
import LiveStreamManagement from "@/components/dashboard/LiveStreamManagement";
import AnnouncementsManagement from "@/components/dashboard/AnnouncementsManagement";
import TitheOfferingManagement from "@/components/dashboard/TitheOfferingManagement";
import ScriptureManagement from "@/components/dashboard/ScriptureManagement";
import ScheduleManagement from "@/components/dashboard/ScheduleManagement";
import DevotionalsManagement from "@/components/dashboard/DevotionalsManagement";
import Members from "@/components/dashboard/Members";
import Events from "@/components/dashboard/Events";
import DonationsManagement from "@/components/dashboard/DonationsManagement";
import MeetingsManagement from "@/components/dashboard/MeetingsManagement";
import PrayerRequests from "@/components/dashboard/PrayerRequests";
import ContactSubmissions from "@/components/dashboard/ContactSubmissions";
import FundraisingManagement from "@/components/dashboard/FundraisingManagement";
import NewsletterManagement from "@/components/dashboard/NewsletterManagement";
import ConnectionCards from "@/components/dashboard/ConnectionCards";
import Reports from "@/components/dashboard/Reports";
import SettingsPanel from "@/components/dashboard/SettingsPanel";
import ResourceManagement from "@/components/dashboard/ResourceManagement";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset sidebar state when switching between mobile and desktop
  useEffect(() => {
    setSidebarCollapsed(isMobile);
  }, [isMobile]);

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
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative z-10 pt-[var(--banner-height)]">
      <DashboardHeader 
        onToggleSidebar={() => setSidebarCollapsed(!isSidebarCollapsed)}
        onSignOut={handleSignOut}
      />

      <div className="flex">
        <DashboardSidebar
          isMobile={isMobile}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          onSignOut={handleSignOut}
        />

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out min-h-[calc(100vh-3.5rem)] w-full",
          !isMobile && (isSidebarCollapsed ? "pl-16" : "pl-72")
        )}>
          <div className="container py-6 px-4 md:px-6 pb-20 mt-14">
            <Routes>
              <Route path="" element={<Overview />} />
              <Route path="live-stream" element={<LiveStreamManagement />} />
              <Route path="announcements" element={<AnnouncementsManagement />} />
              <Route path="tithe-offering" element={<TitheOfferingManagement />} />
              <Route path="schedules" element={<ScheduleManagement />} />
              <Route path="scriptures" element={<ScriptureManagement />} />
              <Route path="devotionals" element={<DevotionalsManagement />} />
              <Route path="members" element={<Members />} />
              <Route path="events" element={<Events />} />
              <Route path="prayer-requests" element={<PrayerRequests />} />
              <Route path="donations" element={<DonationsManagement />} />
              <Route path="meetings" element={<MeetingsManagement />} />
              <Route path="contact" element={<ContactSubmissions />} />
              <Route path="fundraising" element={<FundraisingManagement />} />
              <Route path="newsletter" element={<NewsletterManagement />} />
              <Route path="connection-cards" element={<ConnectionCards />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<SettingsPanel />} />
              <Route path="resources" element={<ResourceManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;