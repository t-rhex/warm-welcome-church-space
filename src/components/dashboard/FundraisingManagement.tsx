import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Heart, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";

const FundraisingManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    ministry: "",
    campaign_type: "ministry",
    goal_amount: "",
    start_date: "",
    end_date: "",
    status: "draft",
    featured: false,
    image_url: "",
    contact_name: "",
    contact_email: "",
    contact_phone: ""
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('fundraising_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error fetching campaigns",
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
      const campaignData = {
        ...formData,
        goal_amount: parseFloat(formData.goal_amount),
        created_by: user?.id,
        published_at: formData.status === 'active' ? new Date().toISOString() : null
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('fundraising_campaigns')
          .update(campaignData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('fundraising_campaigns')
          .insert([campaignData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: editingId ? "Campaign updated" : "Campaign created",
        description: "The campaign has been saved successfully.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        short_description: "",
        ministry: "",
        campaign_type: "ministry",
        goal_amount: "",
        start_date: "",
        end_date: "",
        status: "draft",
        featured: false,
        image_url: "",
        contact_name: "",
        contact_email: "",
        contact_phone: ""
      });
      setEditingId(null);
      fetchCampaigns();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast({
        title: "Error saving campaign",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campaign) => {
    setEditingId(campaign.id);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      short_description: campaign.short_description || "",
      ministry: campaign.ministry,
      campaign_type: campaign.campaign_type,
      goal_amount: campaign.goal_amount.toString(),
      start_date: campaign.start_date.split('.')[0],
      end_date: campaign.end_date ? campaign.end_date.split('.')[0] : "",
      status: campaign.status,
      featured: campaign.featured || false,
      image_url: campaign.image_url || "",
      contact_name: campaign.contact_name || "",
      contact_email: campaign.contact_email || "",
      contact_phone: campaign.contact_phone || ""
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const { error } = await supabase
        .from('fundraising_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Campaign deleted",
        description: "The campaign has been deleted successfully.",
      });

      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error deleting campaign",
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
            {editingId ? "Edit Campaign" : "Create New Campaign"}
          </CardTitle>
          <CardDescription>
            Manage fundraising campaigns for ministries and missions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Campaign Information</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ministry">Ministry</Label>
                  <Input
                    id="ministry"
                    value={formData.ministry}
                    onChange={(e) => setFormData(prev => ({ ...prev, ministry: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign_type">Campaign Type</Label>
                <select
                  id="campaign_type"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.campaign_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaign_type: e.target.value }))}
                >
                  <option value="ministry">Ministry</option>
                  <option value="missions">Missions</option>
                  <option value="project">Project</option>
                  <option value="other">Other</option>
                </select>
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

            {/* Goal and Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Goal and Timeline</h3>
              
              <div className="space-y-2">
                <Label htmlFor="goalAmount">Goal Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    id="goalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.goal_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, goal_amount: e.target.value }))}
                    required
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Featured Campaign</Label>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>
              
              <div className="space-y-2">
                <Label htmlFor="status">Campaign Status</Label>
                <select
                  id="status"
                  className="w-full h-10 px-3 rounded-md border border-input"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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
                      ministry: "",
                      campaign_type: "ministry",
                      goal_amount: "",
                      start_date: "",
                      end_date: "",
                      status: "draft",
                      featured: false,
                      image_url: "",
                      contact_name: "",
                      contact_email: "",
                      contact_phone: ""
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

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Fundraising Campaigns</CardTitle>
          <CardDescription>All fundraising campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No campaigns found
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{campaign.title}</h3>
                      <Badge variant={
                        campaign.status === 'active' ? 'default' :
                        campaign.status === 'draft' ? 'secondary' :
                        campaign.status === 'cancelled' ? 'destructive' :
                        'outline'
                      }>
                        {campaign.status}
                      </Badge>
                      {campaign.featured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {campaign.short_description || campaign.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        {campaign.ministry}
                      </span>
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        ${campaign.current_amount.toLocaleString()} / ${campaign.goal_amount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(campaign.start_date).toLocaleDateString()}
                        {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(campaign)}
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(campaign.id)}
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

export default FundraisingManagement;