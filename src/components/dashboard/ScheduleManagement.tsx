import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_sections: [],
    meta_tags: [],
    day_of_week: "Sunday",
    start_time: "",
    end_time: "",
    location: "",
    type: "Service",
    is_recurring: true,
    status: "active"
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      console.log("Fetching schedules...");
      const { data, error } = await supabase
        .from("church_schedules")
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      console.log("Fetched schedules:", data);
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Error fetching schedules",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const scheduleData = {
        ...formData,
        created_by: user?.id,
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from("church_schedules")
          .update(scheduleData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("church_schedules")
          .insert([scheduleData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: editingId ? "Schedule updated" : "Schedule created",
        description: "The schedule has been saved successfully.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        day_of_week: "Sunday",
        start_time: "",
        end_time: "",
        location: "",
        type: "Service",
        is_recurring: true,
        status: "active"
      });
      setEditingId(null);
      fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error saving schedule",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setFormData({
      title: schedule.title,
      description: schedule.description,
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      location: schedule.location,
      type: schedule.type,
      is_recurring: schedule.is_recurring,
      status: schedule.status
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const { error } = await supabase
        .from('church_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Schedule deleted",
        description: "The schedule has been deleted successfully.",
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error deleting schedule",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Edit Schedule" : "Add New Schedule"}
          </CardTitle>
          <CardDescription>
            Manage weekly church schedules and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                className="min-h-[200px] font-mono"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder={`You can use HTML formatting:

<h2>About This Service</h2>
<p>Join us for worship and fellowship.</p>

<h2>What to Expect</h2>
<ul>
  <li>Worship through music</li>
  <li>Biblical teaching</li>
  <li>Community prayer</li>
</ul>

<h2>Additional Information</h2>
<p>Childcare is provided for ages 0-5.</p>`}
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can use HTML tags for formatting. Available tags: h1-h6, p, ul, li, strong, em, a
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day_of_week">Day of Week</Label>
                <select
                  id="day_of_week"
                  className="w-full h-10 px-3 rounded-md border border-input"
                  value={formData.day_of_week}
                  onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: e.target.value }))}
                >
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="w-full h-10 px-3 rounded-md border border-input"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  {['Service', 'Bible Study', 'Youth Group', 'Prayer Meeting', 'Choir Practice', 'Other'].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
              />
              <Label htmlFor="recurring">Recurring Schedule</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full h-10 px-3 rounded-md border border-input"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (editingId ? "Update" : "Create")}
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      title: "",
                      description: "",
                      day_of_week: "Sunday",
                      start_time: "",
                      end_time: "",
                      location: "",
                      type: "Service",
                      is_recurring: true,
                      status: "active"
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Church Schedules</CardTitle>
          <CardDescription>All weekly schedules and activities</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading schedules...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No schedules found
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{schedule.title}</h3>
                      <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                        {schedule.status}
                      </Badge>
                      <Badge variant="outline">{schedule.type}</Badge>
                    </div>
                    <div 
                      className="text-sm text-muted-foreground mb-3 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: schedule.description }}
                    />
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(schedule)}
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(schedule.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleManagement;