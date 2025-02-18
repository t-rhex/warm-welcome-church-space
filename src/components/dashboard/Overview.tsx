import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Users, MessageSquare, Calendar, User, 
  Heart, ChevronRight, Clock, MapPin,
  ArrowUpRight, ArrowDownRight, Bookmark, Mail
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const StatCard = ({ title, value, change, trend = "up", icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold mb-2">{value}</div>
      <div className="flex items-center text-xs">
        {trend === "up" ? (
          <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
          {change}
        </span>
      </div>
    </CardContent>
  </Card>
);

const Overview = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activePrayers: 0,
    upcomingEvents: 0, 
    newMembers: 0,
    newsletterSubscribers: 0,
    newSubscribers: 0
  });
  const [recentPrayers, setRecentPrayers] = useState([]);
  const [additionalStats, setAdditionalStats] = useState({
    monthlyDonations: 0,
    connectionCards: 0,
    facilityBookings: 0
  });
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent prayers
      const { data: prayers, error: prayersError } = await supabase
        .from('prayers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (prayersError) throw prayersError;

      // Get active prayer count
      const { count: activePrayersCount } = await supabase
        .from('prayers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Fetch upcoming schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from('church_schedules')
        .select('*')
        .eq('status', 'active')
        .limit(5);

      if (scheduleError) throw scheduleError;

      // Get upcoming events count
      const { count: upcomingEventsCount } = await supabase
        .from('church_schedules')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
        
      // Fetch newsletter stats
      const { count: totalSubscribers } = await supabase
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get new subscribers in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: recentSubscribers } = await supabase
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get connection cards count
      const { count: connectionCardsCount } = await supabase
        .from('connection_cards')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      // Get facility bookings
      const { count: facilityBookingsCount } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get donations total for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: donations, error: donationsError } = await supabase
        .from('donations')
        .select('current_amount')
        .gte('created_at', startOfMonth.toISOString())
        .eq('status', 'completed');

      if (donationsError) throw donationsError;

      const monthlyDonations = donations?.reduce((sum, donation) => 
        sum + (parseFloat(donation.current_amount) || 0), 0) || 0;

      // Set the data
      if (prayers) setRecentPrayers(prayers);
      if (schedule) setUpcomingSchedule(schedule);

      setStats({
        totalMembers: 0, // This would come from a members table if implemented
        activePrayers: activePrayersCount || 0,
        upcomingEvents: upcomingEventsCount || 0,
        newMembers: 0, // This would come from a members table if implemented
        newsletterSubscribers: totalSubscribers || 0,
        newSubscribers: recentSubscribers || 0
      });

      // Update additional stats
      setAdditionalStats({
        monthlyDonations,
        connectionCards: connectionCardsCount || 0,
        facilityBookings: facilityBookingsCount || 0
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error fetching dashboard data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          change="+12 from last month"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Active Prayer Requests"
          value={stats.activePrayers}
          change="+2 since yesterday"
          icon={MessageSquare}
          trend="up"
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          change="Next 7 days"
          icon={Calendar}
          trend="up"
        />
        <StatCard
          title="New Members"
          value={stats.newMembers}
          change="This month"
          icon={User}
          trend="up" 
        />
        <StatCard
          title="Newsletter Subscribers"
          value={stats.newsletterSubscribers}
          change={`+${stats.newSubscribers} last 30 days`}
          icon={Mail}
          trend="up"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Recent Prayer Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Recent Prayer Requests</CardTitle>
              <CardDescription>Latest prayer requests from the community</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/prayer-requests" className="gap-2">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPrayers.map((prayer) => (
                <div key={prayer.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 mt-2 rounded-full bg-church-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{prayer.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {prayer.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{prayer.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{prayer.author_name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{new Date(prayer.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>Next 7 days of activities</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/schedules" className="gap-2">
                Manage Schedule
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSchedule.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {event.day_of_week}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.start_time} - {event.end_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild variant="outline" className="justify-between">
              <Link to="/dashboard/announcements">
                Create New Announcement
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link to="/dashboard/devotionals">
                Add Daily Devotional
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link to="/dashboard/scriptures">
                Update Scripture of the Week
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Heart className="w-4 h-4 text-church-500" />
                </div>
                <div>
                  <p className="text-sm">New donation request approved</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <MessageSquare className="w-4 h-4 text-church-500" />
                </div>
                <div>
                  <p className="text-sm">5 new prayer requests need review</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Bookmark className="w-4 h-4 text-church-500" />
                </div>
                <div>
                  <p className="text-sm">New devotional published</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Mail className="w-4 h-4 text-church-500" />
              </div>
              <div>
                <p className="text-sm">New newsletter subscribers</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Activity</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Donations</CardTitle>
            <CardDescription>Monthly Overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${additionalStats.monthlyDonations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month total</p>
        </CardContent>
      </Card>
        <Card>
          <CardHeader>
            <CardTitle>Connection Cards</CardTitle>
            <CardDescription>Needs Follow-up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{additionalStats.connectionCards}</div>
            <p className="text-xs text-muted-foreground">New submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Facility Bookings</CardTitle>
            <CardDescription>Active Bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{additionalStats.facilityBookings}</div>
            <p className="text-xs text-muted-foreground">Approved bookings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;