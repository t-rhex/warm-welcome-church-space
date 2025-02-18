import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Announcement = {
  id: string;
  title: string;
  content: string;
  show_in_banner: boolean;
  start_date: string;
  end_date: string;
  status: string;
  priority: number;
  link?: string;
  link_text?: string;
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('status', 'published')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('priority', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">Important Announcements</h1>
            <p className="text-xl text-church-600">Stay updated with important church announcements</p>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-church-400 mx-auto mb-4" />
                <h3 className="text-xl font-display text-church-800 mb-2">No Active Announcements</h3>
                <p className="text-church-600">Check back later for updates</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-display text-church-800">{announcement.title}</h3>
                          {announcement.show_in_banner && (
                            <Badge variant="secondary" className="bg-church-100 text-church-600">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-church-600 mb-4">{announcement.content}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-church-500">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {announcement.start_date && formatDate(announcement.start_date)}
                            {announcement.end_date && announcement.end_date !== announcement.start_date && (
                              <> - {formatDate(announcement.end_date)}</>
                            )}
                          </span>
                        </div>
                      </div>
                      {announcement.link && (
                        <Button asChild>
                          <Link to={announcement.link}>
                            {announcement.link_text || 'Learn More'}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;