import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Schedule = {
  id: string;
  title: string;
  description: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
  is_recurring: boolean;
};

const ChurchSchedule = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("church_schedules")
        .select('*')
        .eq('status', 'active')
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      console.log("Fetched schedules:", data);
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayNumber = (day: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(day);
  };

  const sortedSchedules = [...schedules].sort((a, b) => {
    return getDayNumber(a.day_of_week) - getDayNumber(b.day_of_week);
  });

  if (loading) {
    return <div className="text-center py-8 text-church-600">Loading schedule...</div>;
  }

  if (!schedules.length) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-display text-church-800 mb-2">No Schedules Available</h3>
        <p className="text-church-600">Check back later for updated schedules.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display text-church-800">Weekly Schedule</h2>
        <Button asChild className="bg-church-600 hover:bg-church-700">
          <Link to="/schedule">View Full Schedule</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {sortedSchedules.map((schedule) => (
          <Card key={schedule.id} className="bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-display text-church-800">{schedule.title}</h3>
                    <Badge variant="secondary" className="bg-church-100 text-church-600">
                      {schedule.type}
                    </Badge>
                    {schedule.is_recurring && (
                      <Badge variant="outline">Recurring</Badge>
                    )}
                  </div>
                  <div 
                    className="text-church-600 mb-4 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: schedule.description }}
                  />
                  <div className="flex flex-wrap gap-4 text-church-500 text-sm">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {schedule.day_of_week}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {schedule.start_time} - {schedule.end_time}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {schedule.location}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChurchSchedule;