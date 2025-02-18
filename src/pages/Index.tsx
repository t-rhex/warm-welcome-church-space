import {
  ChevronDown,
  Clock,
  MapPin,
  Heart,
  BookOpen,
  AlertCircle,
  BookOpenCheck,
  Bookmark,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import ChurchSchedule from "@/components/ChurchSchedule";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ScriptureOfWeek from "@/components/ScriptureOfWeek";
import DailyDevotional from "@/components/DailyDevotional";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import VisionMissionModal from "@/components/VisionMissionModal";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("status", "published")
        .lte("start_date", new Date().toISOString())
        .gte("end_date", new Date().toISOString())
        .order("priority", { ascending: false })
        .limit(3);

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error fetching announcements",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((index) => (
          <Card key={index} className="bg-white">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-church-100 rounded w-1/4"></div>
                <div className="h-6 bg-church-100 rounded w-3/4"></div>
                <div className="h-4 bg-church-100 rounded w-1/2"></div>
                <div className="h-20 bg-church-100 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card className="col-span-3">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-church-400 mx-auto mb-4" />
          <h3 className="text-xl font-display text-church-800 mb-2">
            No Announcements
          </h3>
          <p className="text-church-600">Check back later for updates</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {announcements.map((announcement) => (
        <Card key={announcement.id} className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-church-500 text-sm mb-3">
              <Calendar className="w-4 h-4" />
              {new Date(announcement.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {announcement.priority > 0 && (
              <span className="inline-block px-3 py-1 bg-church-100 text-church-600 rounded-full text-xs mb-3">
                Priority
              </span>
            )}
            <h3 className="text-xl font-display text-church-800 mb-3">
              {announcement.title}
            </h3>
            <p className="text-church-600 mb-4 text-sm">
              {announcement.content}
            </p>
            {announcement.link && (
              <Button
                variant="link"
                className="text-church-600 hover:text-church-800 p-0"
                asChild>
                <Link to={announcement.link}>
                  {announcement.link_text || "Read More"} →
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const FeaturedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .eq("is_featured", true)
        .gte("end_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(3);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching featured events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-6 snap-x">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="min-w-[300px] md:min-w-[400px] snap-start animate-pulse">
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="aspect-video bg-church-100 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-church-100 rounded w-3/4"></div>
                    <div className="h-4 bg-church-100 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex gap-6 overflow-x-auto pb-6 snap-x">
        {events.map((event) => (
          <div
            key={event.id}
            className="min-w-[300px] md:min-w-[400px] snap-start">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="aspect-video bg-church-100 rounded-lg mb-4 overflow-hidden">
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-display text-church-800">
                    {event.title}
                  </h3>
                  <p className="text-church-600">
                    {event.short_description || event.description}
                  </p>
                  <div className="flex items-center gap-2 text-church-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(event.start_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link to={`/events/${event.id}`}>View Event Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-church-50 pt-[var(--banner-height)]">
      <Navigation />

      {/* Hero Section - Adjusted top padding to account for banner and nav */}
      <section className="relative min-h-[calc(100vh-var(--banner-height))] flex items-center justify-center text-center px-4 bg-gradient-to-b from-church-50 to-white py-20 md:py-0">
        <div
          className={`space-y-6 max-w-4xl mx-auto ${
            isVisible ? "animate-fadeIn" : "opacity-0"
          }`}>
          <span className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-church-100 text-church-800 rounded-full text-xs sm:text-sm font-body shadow-sm">
            Welcome to Revival Center Minnesota
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display text-church-900 leading-tight">
            Where Faith Meets Community
          </h1>
          <p className="text-lg sm:text-xl text-church-700 font-body max-w-2xl mx-auto leading-relaxed px-2">
            Join us in creating a warm, inclusive space where everyone is
            welcome to explore faith and find community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8 px-4">
            <Link
              to="/plan-visit"
              className="px-6 sm:px-10 py-4 sm:py-5 bg-church-800 text-white rounded-full font-body hover:bg-church-700 transition-all transform hover:scale-105 shadow-lg inline-flex items-center justify-center text-sm sm:text-base">
              Plan Your Visit
            </Link>
            <VisionMissionModal />
          </div>
        </div>
        <div className="absolute bottom-6 sm:bottom-10 w-full text-center">
          <ChevronDown className="w-6 h-6 mx-auto text-church-400 animate-bounce" />
        </div>
      </section>

      {/* Scripture and Devotional Section */}
      <section className="py-24 bg-gradient-to-b from-white to-church-50">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Daily Prayer Time Counter */}
          <div className="mb-12 text-center">
            <h3 className="text-2xl font-display text-church-800 mb-4">
              Join Us in Prayer
            </h3>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-church-100 rounded-full">
              <div className="w-3 h-3 bg-church-500 rounded-full animate-pulse"></div>
              <span className="text-church-600">
                {new Date().getHours() < 12 ? "Morning" : "Evening"} Prayer Time
              </span>
            </div>
          </div>

          <div className="grid gap-12">
            <ScriptureOfWeek />

            <DailyDevotional />
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-20 bg-church-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-church-500 font-body uppercase tracking-wider text-sm">
              Latest Updates
            </span>
            <h2 className="mt-4 text-4xl font-display text-church-900">
              Church Announcements
            </h2>
          </div>
          <Announcements />
          <div className="text-center mt-12">
            <Button
              variant="outline"
              className="border-church-600 text-church-600 hover:bg-church-600 hover:text-white"
              asChild>
              <Link to="/announcements">View All Announcements</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Events Carousel */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <div>
              <span className="text-church-500 font-body uppercase tracking-wider text-sm">
                Mark Your Calendar
              </span>
              <h2 className="mt-4 text-4xl font-display text-church-900">
                Featured Events
              </h2>
            </div>
            <Button
              variant="outline"
              className="border-church-600 text-church-600 hover:bg-church-600 hover:text-white"
              asChild>
              <Link to="/events">View All Events</Link>
            </Button>
          </div>
          <FeaturedEvents />
        </div>
      </section>

      {/* Service Times Section */}
      <section className="py-24 bg-gradient-to-b from-church-50 to-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-church-500 font-body uppercase tracking-wider text-sm">
              Service Times
            </span>
            <h2 className="mt-4 text-4xl font-display text-church-900">
              Join Us in Worship
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <Clock className="w-10 h-10 text-church-500 mb-4" />
              <h3 className="text-2xl font-display text-church-800 mb-2">
                Sunday Services
              </h3>
              <p className="text-church-600 font-body">
                9:00 AM - Morning Worship
              </p>
              <p className="text-church-600 font-body">
                11:00 AM - Contemporary Service
              </p>
            </div>
            <div className="p-10 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <MapPin className="w-10 h-10 text-church-500 mb-4" />
              <h3 className="text-2xl font-display text-church-800 mb-2">
                Location
              </h3>
              <p className="text-church-600 font-body">123 Faith Street</p>
              <p className="text-church-600 font-body">
                Your City, State 12345
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-church-100">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-church-500 font-body uppercase tracking-wider text-sm">
              Our Values
            </span>
            <h2 className="mt-4 text-4xl font-display text-church-900">
              What We Stand For
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Heart className="w-12 h-12 text-church-500 mx-auto mb-4" />
              <h3 className="text-xl font-display text-church-800 mb-2">
                Love & Community
              </h3>
              <p className="text-church-600 font-body">
                Fostering meaningful connections and supporting one another.
              </p>
            </div>
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-church-500 mx-auto mb-4" />
              <h3 className="text-xl font-display text-church-800 mb-2">
                Faith & Learning
              </h3>
              <p className="text-church-600 font-body">
                Growing together through scripture and shared wisdom.
              </p>
            </div>
            <div className="text-center">
              <Heart className="w-12 h-12 text-church-500 mx-auto mb-4" />
              <h3 className="text-xl font-display text-church-800 mb-2">
                Service & Outreach
              </h3>
              <p className="text-church-600 font-body">
                Making a positive impact in our community and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <ChurchSchedule />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <span className="text-church-500 font-body uppercase tracking-wider text-sm">
            Get in Touch
          </span>
          <h2 className="mt-4 text-4xl font-display text-church-900 mb-8">
            We'd Love to Hear from You
          </h2>
          <div className="bg-church-50 p-8 rounded-2xl">
            <p className="text-church-700 font-body mb-6">
              Have questions? Want to learn more about our community? We're here
              to help.
            </p>
            <Button
              asChild
              className="px-8 py-4 bg-church-800 text-white rounded-full font-body hover:bg-church-700 transition-colors">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
