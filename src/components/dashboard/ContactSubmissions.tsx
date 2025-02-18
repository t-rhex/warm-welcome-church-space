import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, User, Check, Archive } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new');
  const { user } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('status', filter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error fetching submissions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({
          status: newStatus,
          assigned_to: user?.id,
          ...(newStatus === 'completed' ? {
            responded_at: new Date().toISOString(),
            response: response
          } : {})
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Submission has been marked as ${newStatus}`,
      });

      fetchSubmissions();
      if (newStatus === 'completed') {
        setSelectedSubmission(null);
        setResponse("");
      }
    } catch (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
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
              <CardTitle>Contact Form Submissions</CardTitle>
              <CardDescription>Manage and respond to contact form submissions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'new' ? 'default' : 'outline'}
                onClick={() => setFilter('new')}
              >
                New
              </Button>
              <Button
                variant={filter === 'in_progress' ? 'default' : 'outline'}
                onClick={() => setFilter('in_progress')}
              >
                In Progress
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
              <Button
                variant={filter === 'archived' ? 'default' : 'outline'}
                onClick={() => setFilter('archived')}
              >
                Archived
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Submissions List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No {filter} submissions</h3>
                  <p className="text-muted-foreground">
                    {filter === 'new' ? "You're all caught up!" : "No submissions in this category"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className={cn(
                        "p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
                        selectedSubmission?.id === submission.id ? "bg-muted/50" : "bg-card"
                      )}
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{submission.subject}</h3>
                        <Badge variant={
                          submission.status === 'new' ? 'secondary' :
                          submission.status === 'in_progress' ? 'default' :
                          'outline'
                        }>
                          {submission.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {submission.name}
                        </span>
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {submission.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(submission.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submission Details */}
            {selectedSubmission && (
              <Card>
                <CardHeader>
                  <CardTitle>Submission Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-2 text-church-600">
                        <User className="w-4 h-4" />
                        {selectedSubmission.name}
                      </span>
                      <span className="flex items-center gap-2 text-church-600">
                        <Mail className="w-4 h-4" />
                        {selectedSubmission.email}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <p className="text-church-800 font-medium">{selectedSubmission.subject}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Message</Label>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="whitespace-pre-wrap text-church-600">{selectedSubmission.message}</p>
                    </div>
                  </div>

                  {selectedSubmission.status !== 'completed' && (
                    <div className="space-y-2">
                      <Label htmlFor="response">Response</Label>
                      <Textarea
                        id="response"
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Type your response here..."
                        className="min-h-[100px]"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {selectedSubmission.status === 'new' && (
                      <Button
                        onClick={() => handleStatusChange(selectedSubmission.id, 'in_progress')}
                        className="bg-church-600 hover:bg-church-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Start Working
                      </Button>
                    )}
                    {selectedSubmission.status === 'in_progress' && (
                      <Button
                        onClick={() => handleStatusChange(selectedSubmission.id, 'completed')}
                        className="bg-church-600 hover:bg-church-700"
                        disabled={!response.trim()}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}
                    {selectedSubmission.status !== 'archived' && (
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(selectedSubmission.id, 'archived')}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </Button>
                    )}
                  </div>

                  {selectedSubmission.response && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label>Response Sent</Label>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="whitespace-pre-wrap text-church-600">{selectedSubmission.response}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Sent on {formatDate(selectedSubmission.responded_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactSubmissions;