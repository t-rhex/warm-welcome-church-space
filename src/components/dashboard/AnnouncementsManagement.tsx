import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  Eye,
  Archive,
} from "lucide-react";
import { format } from "date-fns";

type Announcement = {
  id: string;
  title: string;
  content: string;
  show_in_banner: boolean;
  start_date: string | null;
  end_date: string | null;
  status: "draft" | "published" | "archived";
  priority: number;
  link: string | null;
  link_text: string | null;
  created_at: string;
  updated_at: string;
};

const AnnouncementsManagement = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    show_in_banner: false,
    start_date: "",
    end_date: "",
    status: "draft" as const,
    priority: 0,
    link: "",
    link_text: "",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error fetching announcements",
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
      const announcementData = {
        ...formData,
        created_by: user?.id,
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from("announcements")
          .update(announcementData)
          .eq("id", editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("announcements")
          .insert([announcementData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: editingId ? "Announcement updated" : "Announcement created",
        description: "The announcement has been saved successfully.",
      });

      // Reset form
      setFormData({
        title: "",
        content: "",
        show_in_banner: false,
        start_date: "",
        end_date: "",
        status: "draft",
        priority: 0,
        link: "",
        link_text: "",
      });
      setEditingId(null);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast({
        title: "Error saving announcement",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      show_in_banner: announcement.show_in_banner,
      start_date: announcement.start_date || "",
      end_date: announcement.end_date || "",
      status: announcement.status,
      priority: announcement.priority,
      link: announcement.link || "",
      link_text: announcement.link_text || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Announcement deleted",
        description: "The announcement has been deleted successfully.",
      });

      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error deleting announcement",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "draft" | "published" | "archived"
  ) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Announcement has been ${newStatus}.`,
      });

      fetchAnnouncements();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error updating status",
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
            {editingId ? "Edit Announcement" : "Create New Announcement"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show_in_banner"
                checked={formData.show_in_banner}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, show_in_banner: checked }))
                }
              />
              <Label htmlFor="show_in_banner">Show in Banner</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      end_date: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  aria-label="Announcement status"
                  className="w-full h-10 px-3 rounded-md border border-input"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link (Optional)</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_text">Link Text (Optional)</Label>
              <Input
                id="link_text"
                value={formData.link_text}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    link_text: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      title: "",
                      content: "",
                      show_in_banner: false,
                      start_date: "",
                      end_date: "",
                      status: "draft",
                      priority: 0,
                      link: "",
                      link_text: "",
                    });
                  }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No announcements found
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{announcement.title}</h3>
                      <Badge
                        variant={
                          announcement.status === "published"
                            ? "default"
                            : announcement.status === "draft"
                            ? "secondary"
                            : "outline"
                        }>
                        {announcement.status}
                      </Badge>
                      {announcement.show_in_banner && (
                        <Badge variant="outline">Banner</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {format(new Date(announcement.created_at), "PPp")}
                      </span>
                      {announcement.start_date && (
                        <span>
                          Starts:{" "}
                          {format(new Date(announcement.start_date), "PPp")}
                        </span>
                      )}
                      {announcement.end_date && (
                        <span>
                          Ends: {format(new Date(announcement.end_date), "PPp")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(announcement)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {announcement.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleStatusChange(announcement.id, "published")
                        }>
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {announcement.status === "published" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleStatusChange(announcement.id, "archived")
                        }>
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(announcement.id)}
                      className="text-destructive">
                      <Trash2 className="w-4 h-4" />
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

export default AnnouncementsManagement;
