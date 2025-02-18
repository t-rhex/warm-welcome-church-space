import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";

const ScriptureManagement = () => {
  const [scriptures, setScriptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    verse_text: "",
    verse_reference: "",
    start_date: "",
    end_date: "",
    status: "active"
  });

  useEffect(() => {
    fetchScriptures();
  }, []);

  const fetchScriptures = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scriptures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScriptures(data);
    } catch (error) {
      console.error("Error fetching scriptures:", error);
      toast({
        title: "Error fetching scriptures",
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
      const scriptureData = {
        ...formData,
        created_by: user?.id,
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('scriptures')
          .update(scriptureData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('scriptures')
          .insert([scriptureData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: editingId ? "Scripture updated" : "Scripture created",
        description: "The scripture has been saved successfully.",
      });

      // Reset form
      setFormData({
        verse_text: "",
        verse_reference: "",
        start_date: "",
        end_date: "",
        status: "active"
      });
      setEditingId(null);
      fetchScriptures();
    } catch (error) {
      console.error('Error saving scripture:', error);
      toast({
        title: "Error saving scripture",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (scripture) => {
    setEditingId(scripture.id);
    setFormData({
      verse_text: scripture.verse_text,
      verse_reference: scripture.verse_reference,
      start_date: scripture.start_date.split('.')[0], // Remove milliseconds
      end_date: scripture.end_date.split('.')[0],
      status: scripture.status
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scripture?')) return;

    try {
      const { error } = await supabase
        .from('scriptures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Scripture deleted",
        description: "The scripture has been deleted successfully.",
      });

      fetchScriptures();
    } catch (error) {
      console.error('Error deleting scripture:', error);
      toast({
        title: "Error deleting scripture",
        description: error.message,
        variant: "destructive",
      });
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Edit Scripture" : "Add New Scripture"}
          </CardTitle>
          <CardDescription>
            Manage the Scripture of the Week content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verse_reference">Verse Reference</Label>
              <Input
                id="verse_reference"
                placeholder="e.g., John 3:16"
                value={formData.verse_reference}
                onChange={(e) => setFormData(prev => ({ ...prev, verse_reference: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verse_text">Verse Text</Label>
              <Textarea
                id="verse_text"
                placeholder="Enter the scripture text..."
                value={formData.verse_text}
                onChange={(e) => setFormData(prev => ({ ...prev, verse_text: e.target.value }))}
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                />
              </div>
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
                      verse_text: "",
                      verse_reference: "",
                      start_date: "",
                      end_date: "",
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
          <CardTitle>Scriptures</CardTitle>
          <CardDescription>All scripture entries</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading scriptures...</div>
          ) : scriptures.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No scriptures found
            </div>
          ) : (
            <div className="space-y-4">
              {scriptures.map((scripture) => (
                <div
                  key={scripture.id}
                  className="flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-medium">{scripture.verse_reference}</h3>
                      <Badge variant={scripture.status === 'active' ? 'default' : 'secondary'}>
                        {scripture.status}
                      </Badge>
                    </div>
                    <p className="text-sm italic mb-3">{scripture.verse_text}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(scripture.start_date)} - {formatDate(scripture.end_date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(scripture)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(scripture.id)}
                      className="text-destructive"
                    >
                      Delete
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

export default ScriptureManagement;