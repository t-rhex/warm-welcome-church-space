import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AnnouncementBanner from "./components/AnnouncementBanner";
import { AuthProvider } from "./components/auth/AuthProvider";
import Announcements from "./pages/Announcements";
import Footer from "./components/Footer";
import Schedule from "./pages/Schedule";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import Events from "./pages/Events";
import Sermons from "./pages/Sermons";
import LiveStream from "./pages/LiveStream";
import DevotionalsArchive from "./pages/DevotionalsArchive";
import Devotional from "./pages/Devotional";
import Resources from "./pages/Resources";
import PlanVisit from "./pages/PlanVisit";
import PrayerRequest from "./pages/PrayerRequest";
import PrayerWall from "./pages/PrayerWall";
import Ministries from "./pages/Ministries";
import Fundraising from "./pages/Fundraising";
import ConnectionCard from "./pages/ConnectionCard";
import Staff from "./pages/Staff";
import Give from "./pages/Give";
import Contact from "./pages/Contact";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showFooter = !location.pathname.startsWith('/dashboard');

  return (
    <>
      <AnnouncementBanner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/events" element={<Events />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/events/:eventId" element={<Events />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/live" element={<LiveStream />} />
        <Route path="/devotionals" element={<DevotionalsArchive />} />
        <Route path="/devotionals/:id" element={<Devotional />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/plan-visit" element={<PlanVisit />} />
        <Route path="/ministries" element={<Ministries />} />
        <Route path="/prayer-wall" element={<PrayerWall />} />
        <Route path="/prayer-request" element={<PrayerRequest />} />
        <Route path="/fundraising" element={<Fundraising />} />
        <Route path="/connect" element={<ConnectionCard />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/give" element={<Give />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;