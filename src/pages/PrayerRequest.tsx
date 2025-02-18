import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; 
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const PrayerRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [showOnWall, setShowOnWall] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and your prayer request.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("prayers").insert({
        title,
        content,
        author_name: name,
        author_email: email,
        is_public: isPublic,
        show_on_wall: showOnWall,
      });

      if (error) throw error;

      toast({
        title: "Prayer request submitted",
        description: "Your prayer request has been submitted successfully.",
      });

      // Reset form
      setTitle("");
      setContent("");
      setName("");
      setEmail("");
      setIsPublic(false);
      setShowOnWall(false);
      setSubmitted(true);

      // Redirect to prayer wall if request is public
      if (isPublic && showOnWall) {
        navigate("/prayer-wall");
      }
    } catch (error) {
      toast({
        title: "Error submitting prayer request",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-church-50">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-display text-church-800">Thank You for Your Prayer Request</h2>
              <p className="text-church-600">Your prayer request has been submitted successfully. Our prayer team will be praying for you.</p>
              {isPublic && showOnWall && <p className="text-church-600">Your request will appear on the prayer wall after review.</p>}
              <Button asChild className="mt-6"><Link to="/prayer-wall">View Prayer Wall</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">Prayer Requests</h1>
            <p className="text-xl text-church-600">Share your prayer needs with our prayer team</p>
          </div>

          <Card className="bg-white max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Submit a Prayer Request</CardTitle>
              <CardDescription>Your request will be shared with our prayer team with full confidentiality. You can also join our live prayer sessions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You don't need to be signed in to submit a prayer request. Your privacy is important to us.
                </AlertDescription>
              </Alert>

              {/* Live Prayer Times */}
              <div className="mb-8 p-4 bg-church-50 rounded-lg">
                <h3 className="font-display text-lg text-church-800 mb-2">Live Prayer Times</h3>
                <div className="space-y-2 text-church-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Morning Prayer: 7:00 AM - 7:30 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Evening Prayer: 7:00 PM - 7:30 PM</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Join Live Prayer
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title"
                    placeholder="Brief title for your prayer request"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={100}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="request">Prayer Request</Label>
                  <Textarea 
                    id="request" 
                    placeholder="Share your prayer request here..." 
                    className="min-h-[150px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    maxLength={2000}
                  />
                  <p className="text-xs text-church-500 text-right">
                    {2000 - content.length} characters remaining
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Your Name (Optional)</Label>
                  <Input 
                    id="name" 
                    placeholder="Your name (optional)" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                  />
                  <p className="text-xs text-church-500">
                    Leave blank to remain anonymous
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-church-500">
                    Optional: Provide if you'd like us to follow up with you
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="public" 
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="public">Make this request public</Label>
                    <p className="text-xs text-church-500">
                      Public prayers can be viewed by others
                    </p>
                  </div>
                </div>

                {isPublic && (
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="wall" 
                      checked={showOnWall}
                      onCheckedChange={setShowOnWall}
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor="wall">Show on Prayer Wall</Label>
                      <p className="text-xs text-church-500">
                        Your prayer will be reviewed before appearing on the wall
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-church-600 hover:bg-church-700"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Prayer Request"}
                </Button>
                <p className="text-xs text-center text-church-500 mt-4">
                  By submitting, you agree to our prayer request guidelines and privacy policy
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrayerRequest;