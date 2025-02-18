import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";

const DonationsManagement = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const { user } = useAuth();

  useEffect(() => {
    fetchDonations();
  }, [filter]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('status', filter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data);
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast({
        title: "Error fetching donations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (donationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('donations')
        .update({
          status: newStatus,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', donationId);

      if (error) throw error;

      toast({
        title: "Donation request updated",
        description: `Donation request has been ${newStatus}`,
      });

      fetchDonations();
    } catch (error) {
      toast({
        title: "Error updating donation request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
              <CardTitle>Donation Requests</CardTitle>
              <CardDescription>Manage donation requests and fundraising campaigns</CardDescription>
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
            <div className="text-center py-8">Loading donation requests...</div>
          ) : donations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No {filter} donation requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{donation.title}</h3>
                        <Badge variant={
                          donation.status === 'pending' ? 'secondary' :
                          donation.status === 'approved' ? 'default' :
                          'outline'
                        }>
                          {donation.status}
                        </Badge>
                        <Badge variant="outline">{donation.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{donation.description}</p>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Goal Amount:</p>
                          <p className="font-medium">{formatCurrency(donation.goal_amount)}</p>
                          <p className="text-muted-foreground mt-2">Current Amount:</p>
                          <p className="font-medium">{formatCurrency(donation.current_amount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requester:</p>
                          <p>{donation.requester_name}</p>
                          <p>{donation.requester_email}</p>
                          {donation.requester_phone && <p>{donation.requester_phone}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
                        <span>Submitted: {formatDate(donation.created_at)}</span>
                        {donation.end_date && (
                          <span>Ends: {formatDate(donation.end_date)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {donation.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(donation.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(donation.id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {donation.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(donation.id, 'completed')}
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

export default DonationsManagement;