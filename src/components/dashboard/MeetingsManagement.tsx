import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";

const MeetingsManagement = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const { user } = useAuth();

  useEffect(() => {
    fetchMeetings();
  }, [filter]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('status', filter)
        .order('meeting_date', { ascending: true });

      if (error) throw error;
      setMeetings(data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast({
        title: "Error fetching meetings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (meetingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({
          status: newStatus,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', meetingId);

      if (error) throw error;

      toast({
        title: "Meeting request updated",
        description: `Meeting request has been ${newStatus}`,
      });

      fetchMeetings();
    } catch (error) {
      toast({
        title: "Error updating meeting request",
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
              <CardTitle>Meeting Requests</CardTitle>
              <CardDescription>Manage room and facility booking requests</CardDescription>
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
            <div className="text-center py-8">Loading meeting requests...</div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No {filter} meeting requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{meeting.title}</h3>
                        <Badge variant={
                          meeting.status === 'pending' ? 'secondary' :
                          meeting.status === 'approved' ? 'default' :
                          'outline'
                        }>
                          {meeting.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{meeting.description}</p>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Meeting Details:</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(meeting.meeting_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>{meeting.duration_minutes} minutes</span>
                          </div>
                          <p className="mt-2">Expected Attendees: {meeting.expected_attendees}</p>
                          {meeting.room_preference && (
                            <p className="mt-1">Preferred Room: {meeting.room_preference}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground">Organizer:</p>
                          <p>{meeting.organizer_name}</p>
                          <p>{meeting.organizer_email}</p>
                          {meeting.organizer_phone && <p>{meeting.organizer_phone}</p>}
                        </div>
                      </div>
                      {meeting.equipment_needed && meeting.equipment_needed.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">Equipment Needed:</p>
                          <div className="flex flex-wrap gap-2">
                            {meeting.equipment_needed.map((item) => (
                              <Badge key={item} variant="secondary">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {meeting.notes && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">Additional Notes:</p>
                          <p className="text-sm mt-1">{meeting.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {meeting.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(meeting.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(meeting.id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {meeting.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(meeting.id, 'completed')}
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

export default MeetingsManagement;