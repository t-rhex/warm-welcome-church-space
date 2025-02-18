import { AlertCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Announcement = {
  id: string;
  title: string;
  content: string;
  link?: string;
  link_text?: string;
};

const AnnouncementBanner = () => {
  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentAnnouncement();
  }, []);

  const fetchCurrentAnnouncement = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, content, link, link_text")
        .eq("status", "published")
        .eq("show_in_banner", true)
        .lte("start_date", new Date().toISOString())
        .gte("end_date", new Date().toISOString())
        .order("priority", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setCurrentAnnouncement(data[0]);
        console.log("Found banner announcement:", data[0]);
      }
    } catch (error) {
      console.error("Error fetching announcement:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !currentAnnouncement) {
    document.documentElement.style.setProperty("--banner-height", "0px");
    if (!loading && !currentAnnouncement) {
      console.log("No active banner announcements found");
    }
    return null;
  }

  document.documentElement.style.setProperty("--banner-height", "2.5rem");

  return (
    <Alert className="fixed top-0 left-0 right-0 z-[100] rounded-none border-none bg-church-600 text-white h-[2.5rem] flex items-center shadow-sm">
      <div className="container mx-auto max-w-6xl flex items-center justify-center gap-4 px-4">
        <div className="flex items-center gap-2 text-center">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm">{currentAnnouncement.content}</span>
          {currentAnnouncement.link && (
            <Button
              variant="link"
              className="text-white hover:text-church-100 whitespace-nowrap px-2 h-8"
              asChild>
              <Link to={currentAnnouncement.link}>
                {currentAnnouncement.link_text || "Learn More"} →
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default AnnouncementBanner;
