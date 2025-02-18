import Navigation from "../components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Share2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

// Facebook SDK initialization
const initFacebookSDK = () => {
  if (window.FB) return;
  
  window.fbAsyncInit = function() {
    window.FB.init({
      xfbml: true,
      version: 'v19.0'
    });
  };

  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
};

const LiveStream = () => {
  const [currentStream, setCurrentStream] = useState(null);
  const [nextStream, setNextStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    initFacebookSDK();
    fetchStreamData();

    // Update stream data every minute
    const interval = setInterval(fetchStreamData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStreamData = async () => {
    try {
      const now = new Date().toISOString();

      // Get current live stream
      const { data: liveStream, error: liveError } = await supabase
        .from('live_streams')
        .select('*')
        .eq('status', 'live')
        .lte('start_time', now)
        .gte('end_time', now)
        .maybeSingle();

      if (liveError) throw liveError;
      setCurrentStream(liveStream);

      // If no live stream, get next scheduled stream
      if (!liveStream) {
        const { data: nextStream, error: nextError } = await supabase
          .from('live_streams')
          .select('*')
          .eq('status', 'scheduled')
          .gt('start_time', now)
          .order('start_time', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (nextError) throw nextError;
        setNextStream(nextStream);
      }
    } catch (error) {
      console.error('Error fetching stream data:', error);
      toast({
        title: "Error fetching stream data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update countdown timer
  useEffect(() => {
    if (!nextStream) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const streamTime = new Date(nextStream.start_time).getTime();
      const distance = streamTime - now;

      if (distance < 0) {
        setCountdown("");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextStream]);

  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            {currentStream ? (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full mb-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Live Now
                </div>
                <h1 className="text-4xl md:text-5xl font-display text-church-900 mb-4">{currentStream.title}</h1>
                <p className="text-xl text-church-600">Join us for worship from wherever you are</p>
              </>
            ) : nextStream ? (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-church-100 text-church-600 rounded-full mb-4">
                  <Clock className="w-4 h-4" />
                  Starting in {countdown}
                </div>
                <h1 className="text-4xl md:text-5xl font-display text-church-900 mb-4">{nextStream.title}</h1>
                <p className="text-xl text-church-600">
                  Join us on {new Date(nextStream.start_time).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })} at {new Date(nextStream.start_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-church-100 text-church-600 rounded-full mb-4">
                  <AlertCircle className="w-4 h-4" />
                  No Streams Scheduled
                </div>
                <h1 className="text-4xl md:text-5xl font-display text-church-900 mb-4">Live Stream</h1>
                <p className="text-xl text-church-600">Check back later for our next live stream</p>
              </>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Stream */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white">
                <CardContent className="p-0">
                  <div className="aspect-video bg-church-900 relative overflow-hidden">
                    {currentStream ? (
                      <div 
                        className="fb-video" 
                        data-href={currentStream.platform === 'youtube' ? currentStream.youtube_url : currentStream.facebook_url}
                        data-width="100%"
                        data-show-text="false"
                      ></div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        {nextStream ? (
                          <div className="text-center">
                            <h3 className="text-xl mb-2">Next Stream</h3>
                            <p className="text-lg mb-4">{nextStream.title}</p>
                            <div className="text-2xl font-bold">{countdown}</div>
                          </div>
                        ) : (
                          <p>No upcoming streams scheduled</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {currentStream && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 bg-church-600 hover:bg-church-700">
                    Join Live Chat
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Service Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentStream ? (
                    <>
                      <div className="flex items-center gap-3 text-church-600">
                        <Calendar className="w-5 h-5" />
                        <span>{new Date(currentStream.start_time).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-church-600">
                        <Clock className="w-5 h-5" />
                        <span>
                          {new Date(currentStream.start_time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            timeZoneName: 'short'
                          })}
                        </span>
                      </div>
                      {currentStream.description && (
                        <div className="mt-4 p-4 bg-church-50 rounded-lg">
                          <p className="text-church-600 whitespace-pre-wrap">
                            {currentStream.description}
                          </p>
                        </div>
                      )}
                    </>
                  ) : nextStream ? (
                    <>
                      <div className="flex items-center gap-3 text-church-600">
                        <Calendar className="w-5 h-5" />
                        <span>
                          {new Date(nextStream.start_time).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-church-600">
                        <Clock className="w-5 h-5" />
                        <span>
                          {new Date(nextStream.start_time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            timeZoneName: 'short'
                          })}
                        </span>
                      </div>
                      <div className="mt-4 p-4 bg-church-50 rounded-lg">
                        <h4 className="font-medium text-church-800 mb-2">Next Stream</h4>
                        <div className="text-2xl font-bold text-church-600 mb-2">
                          {countdown}
                        </div>
                        {nextStream.description && (
                          <p className="text-church-600 text-sm whitespace-pre-wrap">
                            {nextStream.description}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-church-600">
                      No streams currently scheduled
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Upcoming Streams</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : streams.filter(s => s.status === 'scheduled').length === 0 ? (
                    <div className="text-center py-4 text-church-600">
                      No upcoming streams scheduled
                    </div>
                  ) : (
                    streams
                      .filter(s => s.status === 'scheduled')
                      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                      .slice(0, 3)
                      .map(stream => (
                        <div key={stream.id} className="p-3 rounded-lg bg-church-50">
                          <p className="font-medium text-church-800">{stream.title}</p>
                          <p className="text-sm text-church-600">
                            {new Date(stream.start_time).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })} • {new Date(stream.start_time).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      ))
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Need Prayer?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-church-600 mb-4">
                    Our prayer team is available to pray with you during the service.
                  </p>
                  <Button className="w-full bg-church-600 hover:bg-church-700">
                    Request Prayer
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStream;