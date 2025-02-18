import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";

const LiveStreamManagement = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: "facebook",
    facebook_url: "",
    youtube_url: "",
    status: "scheduled",
    start_time: "",
    end_time: ""
  });

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) throw error;
      setStreams(data || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast({
        title: "Error fetching streams",
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
      const streamData = {
        ...formData,
        created_by: user?.id
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('live_streams')
          .update(streamData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('live_streams')
          .insert([streamData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: editingId ? "Stream updated" : "Stream scheduled",
        description: "The live stream has been saved successfully.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        platform: "facebook",
        facebook_url: "",
        youtube_url: "",
        status: "scheduled",
        start_time: "",
        end_time: ""
      });
      setEditingId(null);
      fetchStreams();
    } catch (error) {
      console.error('Error saving stream:', error);
      toast({
        title: "Error saving stream",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stream) => {
    setEditingId(stream.id);
    setFormData({
      title: stream.title,
      description: stream.description || "",
      platform: stream.platform,
      facebook_url: stream.facebook_url || "",
      youtube_url: stream.youtube_url || "",
      status: stream.status,
      start_time: stream.start_time.split('.')[0],
      end_time: stream.end_time.split('.')[0]
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stream?')) return;

    try {
      const { error } = await supabase
        .from('live_streams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Stream deleted",
        description: "The live stream has been deleted successfully.",
      });

      fetchStreams();
    } catch (error) {
      console.error('Error deleting stream:', error);
      toast({
        title: "Error deleting stream",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('live_streams')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Stream has been marked as ${newStatus}`,
      });

      fetchStreams();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Edit Live Stream" : "Schedule New Live Stream"}
          </CardTitle>
          <CardDescription>
            Schedule and manage church live streams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Stream Title</Label>
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
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Streaming Platform</Label>
                <select
                  id="platform"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.platform}
                  onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                  required
                >
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="both">Both</option>
                </select>
              </div>

              {(formData.platform === 'facebook' || formData.platform === 'both') && (
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook Page URL</Label>
                  <Input
                    id="facebookUrl"
                    value={formData.facebook_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                    placeholder="https://facebook.com/your-page"
                  />
                </div>
              )}

              {(formData.platform === 'youtube' || formData.platform === 'both') && (
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube Channel URL</Label>
                  <Input
                    id="youtubeUrl"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                    placeholder="https://youtube.com/your-channel"
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  required
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                  <option value="ended">Ended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (editingId ? "Update" : "Schedule")}
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
                      platform: "facebook",
                      facebook_url: "",
                      youtube_url: "",
                      status: "scheduled",
                      start_time: "",
                      end_time: ""
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

      {/* Streams List */}
      <Card>
        <CardHeader>
          <CardTitle>Live Streams</CardTitle>
          <CardDescription>All scheduled and past live streams</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading streams...</div>
          ) : streams.length === 0 ? (
            <div className="text-center py-4">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Live Streams</h3>
              <p className="text-muted-foreground">
                Schedule your first live stream to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {streams.map((stream) => (
                <div
                  key={stream.id}
                  className="flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{stream.title}</h3>
                      <Badge variant={
                        stream.status === 'live' ? 'destructive' :
                        stream.status === 'scheduled' ? 'default' :
                        stream.status === 'ended' ? 'secondary' :
                        'outline'
                      }>
                        {stream.status}
                      </Badge>
                      <Badge variant="outline">
                        {stream.platform === 'both' ? 'Facebook & YouTube' : 
                         stream.platform.charAt(0).toUpperCase() + stream.platform.slice(1)}
                      </Badge>
                    </div>
                    {stream.description && (
                      <p className="text-sm text-muted-foreground mb-3">{stream.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(stream.start_time)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Duration: {Math.round((new Date(stream.end_time).getTime() - new Date(stream.start_time).getTime()) / (1000 * 60))} minutes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {stream.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(stream.id, 'live')}
                        className="gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Start Stream
                      </Button>
                    )}
                    {stream.status === 'live' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(stream.id, 'ended')}
                        className="gap-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        End Stream
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(stream)}
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(stream.id)}
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

export default LiveStreamManagement;