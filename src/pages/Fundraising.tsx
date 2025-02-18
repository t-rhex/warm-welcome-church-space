import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const Fundraising = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('fundraising_campaigns')
        .select('*')
        .eq('status', 'active')
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

  const calculateProgress = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">Support Our Mission</h1>
            <p className="text-xl text-church-600">Join us in making a difference through our ministry and missions</p>
          </div>

          {/* Featured Campaigns */}
          {campaigns.some(c => c.featured) && (
            <div className="mb-16">
              <h2 className="text-2xl font-display text-church-800 mb-6">Featured Campaigns</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                {campaigns.filter(c => c.featured).map((campaign) => (
                  <Card key={campaign.id} className="bg-white">
                    <CardContent className="p-6">
                      {campaign.image_url && (
                        <div className="aspect-video mb-6 rounded-lg overflow-hidden">
                          <img 
                            src={campaign.image_url} 
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-church-100 text-church-600">
                            {campaign.campaign_type}
                          </Badge>
                          <Badge variant="outline">{campaign.ministry}</Badge>
                        </div>
                        <h3 className="text-2xl font-display text-church-800">{campaign.title}</h3>
                        <p className="text-church-600">{campaign.short_description || campaign.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-church-600">
                              ${campaign.current_amount.toLocaleString()} raised
                            </span>
                            <span className="text-church-600">
                              Goal: ${campaign.goal_amount.toLocaleString()}
                            </span>
                          </div>
                          <Progress 
                            value={calculateProgress(campaign.current_amount, campaign.goal_amount)} 
                            className="h-2"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-church-500">
                            {campaign.end_date ? (
                              <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Ends {new Date(campaign.end_date).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Ongoing Campaign
                              </span>
                            )}
                          </div>
                          <Button className="bg-church-600 hover:bg-church-700">
                            Donate Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Active Campaigns */}
          <div>
            <h2 className="text-2xl font-display text-church-800 mb-6">All Campaigns</h2>
            {loading ? (
              <div className="text-center py-8">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="w-12 h-12 text-church-400 mx-auto mb-4" />
                  <h3 className="text-xl font-display text-church-800 mb-2">No Active Campaigns</h3>
                  <p className="text-church-600">Check back later for new fundraising campaigns</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.filter(c => !c.featured).map((campaign) => (
                  <Card key={campaign.id} className="bg-white">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-church-100 text-church-600">
                            {campaign.campaign_type}
                          </Badge>
                          <Badge variant="outline">{campaign.ministry}</Badge>
                        </div>
                        <h3 className="text-xl font-display text-church-800">{campaign.title}</h3>
                        <p className="text-church-600">{campaign.short_description || campaign.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-church-600">
                              ${campaign.current_amount.toLocaleString()} raised
                            </span>
                            <span className="text-church-600">
                              Goal: ${campaign.goal_amount.toLocaleString()}
                            </span>
                          </div>
                          <Progress 
                            value={calculateProgress(campaign.current_amount, campaign.goal_amount)} 
                            className="h-2"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-church-500">
                            {campaign.end_date ? (
                              <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Ends {new Date(campaign.end_date).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Ongoing Campaign
                              </span>
                            )}
                          </div>
                          <Button className="bg-church-600 hover:bg-church-700">
                            Donate Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fundraising;