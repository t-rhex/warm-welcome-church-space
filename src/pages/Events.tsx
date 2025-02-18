import Navigation from "../components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, ArrowLeft, Share2, Facebook, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const ShareButton = ({ icon: Icon, label, onClick, className = "" }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className={`h-9 w-9 ${className}`}
        onClick={onClick}
      >
        <Icon className="h-4 w-4" />
        <span className="sr-only">{label}</span>
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Share on {label}</p>
    </TooltipContent>
  </Tooltip>
);

const EventList = ({ events, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 text-church-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-display text-church-800 mb-2">Loading events...</h3>
        </CardContent>
      </Card>
    );
  }

  if (!events.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 text-church-400 mx-auto mb-4" />
          <h3 className="text-xl font-display text-church-800 mb-2">No Upcoming Events</h3>
          <p className="text-church-600">Check back later for upcoming events</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <Card key={event.id} className="group bg-white hover:shadow-xl transition-all duration-300">
          <div className="grid md:grid-cols-5 overflow-hidden">
            <div className="md:col-span-2 relative">
              <img
                src={event.image_url || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'} 
                alt={event.title}
                className="w-full h-64 md:h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
              <div className="absolute bottom-4 left-4 md:hidden">
                <Badge variant="secondary" className="bg-white/90 text-church-800 mb-2">
                  {event.category}
                </Badge>
                <h3 className="text-2xl font-display text-white mb-2">{event.title}</h3>
              </div>
            </div>
            <div className="md:col-span-3">
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="hidden md:block bg-church-100 p-4 rounded-xl text-center min-w-[120px] shadow-sm">
                    <Calendar className="w-6 h-6 text-church-600 mx-auto mb-1" />
                    <div className="text-church-800 font-display">
                      <div className="text-2xl font-bold">
                        {new Date(event.start_date).getDate()}
                      </div>
                      <div className="text-sm uppercase">
                        {new Date(event.start_date).toLocaleString('default', { month: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="hidden md:flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-church-100 text-church-600">
                        {event.category}
                      </Badge>
                      {event.is_featured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                    </div>
                    <h3 className="hidden md:block text-2xl font-display text-church-800 mb-3">{event.title}</h3>
                    <p className="text-church-600 mb-6 line-clamp-2 md:line-clamp-none">
                      {event.short_description || event.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 text-church-500 mb-6">
                      <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(event.start_date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location || event.venue_name}
                        </span>
                      </div>
                      {event.registration_required && (
                        <div className="flex items-center gap-2 text-church-400">
                          <Users className="w-4 h-4" />
                          {event.max_attendees ? (
                            `${event.current_attendees || 0} / ${event.max_attendees} registered`
                          ) : (
                            `${event.current_attendees || 0} registered`
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button asChild className="bg-church-600 hover:bg-church-700">
                        <Link to={`/events/${event.id}`}>
                          View Details
                        </Link>
                      </Button>
                      {event.registration_required && event.registration_url && (
                        <Button variant="outline">Register Now</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const SingleEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: "Error fetching event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform) => {
    const shareUrl = window.location.href;
    const shareTitle = event?.title;
    const shareText = event?.description;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nLearn more: ${shareUrl}`)}`;
        break;
      default:
        if (navigator.share) {
          try {
            await navigator.share({
              title: shareTitle,
              text: shareText,
              url: shareUrl,
            });
          } catch (err) {
            console.error('Error sharing:', err);
          }
        }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading event details...</div>;
  }

  if (!event) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 text-church-400 mx-auto mb-4" />
          <h3 className="text-xl font-display text-church-800 mb-2">Event Not Found</h3>
          <p className="text-church-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <Button asChild variant="outline">
            <Link to="/events">View All Events</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/events')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Button>

      <Card className="bg-white">
        <div className="aspect-video w-full">
          <img 
            src={event.image_url || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-church-100 text-church-600">
                {event.category}
              </Badge>
              {event.is_featured && (
                <Badge variant="outline">Featured</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 border-r pr-2">
                <ShareButton
                  icon={Facebook}
                  label="Facebook"
                  onClick={() => handleShare('facebook')}
                  className="text-blue-600 hover:text-blue-700"
                />
                <ShareButton
                  icon={Twitter}
                  label="Twitter"
                  onClick={() => handleShare('twitter')}
                  className="text-sky-500 hover:text-sky-600"
                />
                <ShareButton
                  icon={Mail}
                  label="Email"
                  onClick={() => handleShare('email')}
                  className="text-gray-600 hover:text-gray-700"
                />
              </div>
              {event.registration_required && event.registration_url && (
                <Button className="bg-church-600 hover:bg-church-700">
                  Register to Attend
                </Button>
              )}
            </div>
          </div>
          <CardTitle className="text-3xl">{event.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-church-600">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(event.start_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {new Date(event.start_date).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {event.location || event.venue_name}
              </span>
            </div>
          </div>
        </CardHeader>
        <div className="p-6">
          <div className="space-y-4">
            {event.description.split('\n').map((paragraph, index) => (
              <div key={index} className="text-church-600">
                {paragraph}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

const Events = () => {
  const { eventId } = useParams();
  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    if (!eventId) {
      fetchEvents();
    }
  }, [eventId]);

  const fetchEvents = async () => {
    try {
      // Fetch featured events first
      const { data: featured, error: featuredError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (featuredError) throw featuredError;
      setFeaturedEvents(featured || []);

      // Fetch all events
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', false)
        .gte('end_date', new Date().toISOString())
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

  const displayedEvents = showAllEvents ? [...featuredEvents, ...events] : featuredEvents;

  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {!eventId && (
            <div className="text-center mb-12 space-y-6">
              <div>
                <h1 className="text-5xl font-display text-church-900 mb-4">Upcoming Events</h1>
                <p className="text-xl text-church-600">Join us for worship, fellowship, and growth</p>
              </div>
              {!showAllEvents && events.length > 0 && (
                <Button 
                  onClick={() => setShowAllEvents(true)}
                  variant="outline"
                  className="border-church-600 text-church-600 hover:bg-church-600 hover:text-white"
                >
                  View All Events
                </Button>
              )}
            </div>
          )}

          {eventId ? (
            <SingleEvent />
          ) : (
            <>
              {!showAllEvents && featuredEvents.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-display text-church-800 mb-6 text-center">Featured Events</h2>
                  <EventList events={featuredEvents} loading={loading} />
                </div>
              )}
              {showAllEvents && (
                <div>
                  <h2 className="text-2xl font-display text-church-800 mb-6 text-center">All Events</h2>
                  <EventList events={displayedEvents} loading={loading} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;