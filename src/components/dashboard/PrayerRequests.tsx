import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";

const PrayerRequests = () => {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const { user } = useAuth();

  useEffect(() => {
    fetchPrayers();
  }, [filter]);

  const fetchPrayers = async () => {
    setLoading(true);
    try {
      // Attempt to get the prayers with detailed error logging
      const { data, error } = await supabase
        .from('prayers')
        .select(`
          id,
          title,
          content,
          author_name,
          author_email,
          is_public,
          show_on_wall,
          prayer_count,
          status,
          created_at,
          approved_at,
          approved_by
        `)
        .eq('status', filter)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      setPrayers(data || []);
    } catch (error) {
      console.error("Error fetching prayers:", error);

      toast({
        title: "Error fetching prayers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (prayerId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('prayers')
        .update({ 
          status: newStatus,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', prayerId);

      if (error) throw error;

      toast({
        title: "Prayer request updated",
        description: `Prayer request has been ${newStatus}`,
      });

      fetchPrayers();
    } catch (error) {
      toast({
        title: "Error updating prayer request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prayer Requests</CardTitle>
              <CardDescription>Manage and respond to prayer requests</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilter('approved')}
              >
                Approved
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading prayers...</div>
          ) : prayers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No {filter} prayer requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{prayer.title}</h3>
                        <Badge variant={
                          prayer.status === 'pending' ? 'secondary' :
                          prayer.status === 'approved' ? 'default' :
                          'outline'
                        }>
                          {prayer.status}
                        </Badge>
                        {prayer.is_public && (
                          <Badge variant="outline">Public</Badge>
                        )}
                        {prayer.show_on_wall && (
                          <Badge variant="outline">Show on Wall</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{prayer.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>By: {prayer.author_name || 'Anonymous'}</span>
                        <span>Submitted: {formatDate(prayer.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {prayer.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(prayer.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(prayer.id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {prayer.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(prayer.id, 'completed')}
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
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

export default PrayerRequests;