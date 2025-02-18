import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const ConnectionCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new');

  useEffect(() => {
    fetchCards();
  }, [filter]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('connection_cards')
        .select('*')
        .eq('status', filter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error("Error fetching connection cards:", error);
      toast({
        title: "Error fetching connection cards",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (cardId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('connection_cards')
        .update({ 
          status: newStatus,
          contacted_at: newStatus === 'contacted' ? new Date().toISOString() : null
        })
        .eq('id', cardId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Connection card has been marked as ${newStatus}`,
      });

      fetchCards();
    } catch (error) {
      toast({
        title: "Error updating status",
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
              <CardTitle>Connection Cards</CardTitle>
              <CardDescription>Manage visitor connection cards</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'new' ? 'default' : 'outline'}
                onClick={() => setFilter('new')}
              >
                New
              </Button>
              <Button
                variant={filter === 'contacted' ? 'default' : 'outline'}
                onClick={() => setFilter('contacted')}
              >
                Contacted
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
            <div className="text-center py-8">Loading connection cards...</div>
          ) : cards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No {filter} connection cards found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">
                          {card.first_name} {card.last_name}
                        </h3>
                        <Badge variant={
                          card.status === 'new' ? 'secondary' :
                          card.status === 'contacted' ? 'default' :
                          'outline'
                        }>
                          {card.status}
                        </Badge>
                        {card.visit_type && (
                          <Badge variant="outline">
                            {card.visit_type.replace('-', ' ')}
                          </Badge>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Contact Information:</p>
                          <p>Email: {card.email}</p>
                          {card.phone && <p>Phone: {card.phone}</p>}
                        </div>
                        {card.address && (
                          <div>
                            <p className="text-muted-foreground">Address:</p>
                            <p>{card.address}</p>
                            <p>{card.city}, {card.state} {card.zip_code}</p>
                          </div>
                        )}
                      </div>
                      {card.interested_in?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">Interested in:</p>
                          <div className="flex flex-wrap gap-2">
                            {card.interested_in.map((interest) => (
                              <Badge key={interest} variant="secondary">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {card.prayer_request && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">Prayer Request:</p>
                          <p className="text-sm mt-1">{card.prayer_request}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
                        <span>Submitted: {formatDate(card.created_at)}</span>
                        {card.contacted_at && (
                          <span>Contacted: {formatDate(card.contacted_at)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {card.status === 'new' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(card.id, 'contacted')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Mark Contacted
                        </Button>
                      )}
                      {card.status === 'contacted' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(card.id, 'completed')}
                        >
                          Mark Completed
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

export default ConnectionCards;