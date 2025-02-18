import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Pencil, Trash2, ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    start_date: "",
    end_date: "",
    location: "",
    venue_name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    is_featured: false,
    is_recurring: false,
    category: "general",
    tags: [],
    status: "draft",
    max_attendees: "",
    registration_required: false,
    registration_deadline: "",
    registration_url: "",
    image_url: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    cost: ""
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error fetching events",
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
    
    // Validate required dates
    if (!formData.start_date || !formData.end_date) {
      toast({
        title: "Missing dates",
        description: "Start date and end date are required",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const eventData = {
        ...formData,
        created_by: user?.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        registration_deadline: formData.registration_deadline || null
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('events')
          .insert([eventData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: editingId ? "Event updated" : "Event created",
        description: "The event has been saved successfully.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        short_description: "",
        start_date: "",
        end_date: "",
        location: "",
        venue_name: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        is_featured: false,
        is_recurring: false,
        category: "general",
        tags: [],
        status: "draft",
        max_attendees: "",
        registration_required: false,
        registration_deadline: "",
        registration_url: "",
        image_url: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        cost: ""
      });
      setEditingId(null);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error saving event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      short_description: event.short_description || "",
      start_date: event.start_date.split('.')[0],
      end_date: event.end_date.split('.')[0],
      location: event.location || "",
      venue_name: event.venue_name || "",
      address: event.address || "",
      city: event.city || "",
      state: event.state || "",
      zip_code: event.zip_code || "",
      is_featured: event.is_featured || false,
      is_recurring: event.is_recurring || false,
      category: event.category || "general",
      tags: event.tags || [],
      status: event.status || "draft",
      max_attendees: event.max_attendees?.toString() || "",
      registration_required: event.registration_required || false,
      registration_deadline: event.registration_deadline ? event.registration_deadline.split('.')[0] : "",
      registration_url: event.registration_url || "",
      image_url: event.image_url || "",
      contact_name: event.contact_name || "",
      contact_email: event.contact_email || "",
      contact_phone: event.contact_phone || "",
      cost: event.cost?.toString() || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });

      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
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
            {editingId ? "Edit Event" : "Create New Event"}
          </CardTitle>
          <CardDescription>
            Manage church events and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="general">General</option>
                    <option value="worship">Worship</option>
                    <option value="youth">Youth</option>
                    <option value="children">Children</option>
                    <option value="missions">Missions</option>
                    <option value="community">Community</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.short_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Date and Time</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
                />
                <Label htmlFor="recurring">Recurring Event</Label>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="venueName">Venue Name</Label>
                  <Input
                    id="venueName"
                    value={formData.venue_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zip_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Registration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Registration</h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="registration"
                  checked={formData.registration_required}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, registration_required: checked }))}
                />
                <Label htmlFor="registration">Registration Required</Label>
              </div>

              {formData.registration_required && (
                <div className="space-y-4 sm:pl-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                      <Input
                        id="maxAttendees"
                        type="number"
                        value={formData.max_attendees}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_attendees: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                      <Input
                        id="registrationDeadline"
                        type="datetime-local"
                        value={formData.registration_deadline}
                        onChange={(e) => setFormData(prev => ({ ...prev, registration_deadline: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationUrl">Registration URL (Optional)</Label>
                    <Input
                      id="registrationUrl"
                      type="url"
                      value={formData.registration_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, registration_url: e.target.value }))}
                      placeholder="https://"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={formData.contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Details</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost (Optional)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                />
                <Label htmlFor="featured">Featured Event</Label>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>
              
              <div className="space-y-2">
                <Label htmlFor="status">Event Status</Label>
                <select
                  id="status"
                  className="w-full h-10 px-3 rounded-md border border-input"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
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
                      short_description: "",
                      start_date: "",
                      end_date: "",
                      location: "",
                      venue_name: "",
                      address: "",
                      city: "",
                      state: "",
                      zip_code: "",
                      is_featured: false,
                      is_recurring: false,
                      category: "general",
                      tags: [],
                      status: "draft",
                      max_attendees: "",
                      registration_required: false,
                      registration_deadline: "",
                      registration_url: "",
                      image_url: "",
                      contact_name: "",
                      contact_email: "",
                      contact_phone: "",
                      cost: ""
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

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>All church events</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No events found
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{event.title}</h3>
                      <Badge variant={
                        event.status === 'published' ? 'default' :
                        event.status === 'draft' ? 'secondary' :
                        event.status === 'cancelled' ? 'destructive' :
                        'outline'
                      }>
                        {event.status}
                      </Badge>
                      {event.is_featured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{event.short_description || event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(event.start_date)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(event.end_date)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                      )}
                      {event.registration_required && (
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {event.current_attendees || 0} / {event.max_attendees || '∞'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
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

export default Events;