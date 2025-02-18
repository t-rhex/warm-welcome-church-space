import Navigation from "../components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Clock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";

const mockPrayers = [
  {
    id: 1,
    author: "Sarah M.",
    content: "Please pray for my mother's upcoming surgery next week.",
    prayerCount: 25,
    timestamp: "2024-03-24T10:30:00",
    category: "Health"
  },
  {
    id: 2,
    author: "John D.",
    content: "Grateful for answered prayers - my son got accepted into college! Please continue to pray for his journey.",
    prayerCount: 18,
    timestamp: "2024-03-24T09:15:00",
    category: "Praise Report"
  },
  {
    id: 3,
    author: "Anonymous",
    content: "Seeking prayers for guidance in making an important career decision.",
    prayerCount: 12,
    timestamp: "2024-03-24T08:45:00",
    category: "Guidance"
  },
  {
    id: 4,
    author: "Maria R.",
    content: "Please pray for our community outreach program starting next month.",
    prayerCount: 31,
    timestamp: "2024-03-23T22:20:00",
    category: "Ministry"
  },
  {
    id: 5,
    author: "David W.",
    content: "Thankful for this prayer community. Please pray for my family as we navigate a difficult transition.",
    prayerCount: 15,
    timestamp: "2024-03-23T20:10:00",
    category: "Family"
  }
];

const PrayerCard = ({ prayer, onPrayerCountUpdate }) => {
  const { user } = useAuth();
  const [hasPrayed, setHasPrayed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkInteraction = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('prayer_interactions')
        .select('id')
        .eq('prayer_id', prayer.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking prayer interaction:", error);
        return;
      }
      
      setHasPrayed(!!data);
    };

    checkInteraction();
  }, [prayer.id, user]);

  const handlePrayerClick = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to pray for requests",
        variant: "destructive",
      });
      return;
    }

    if (!hasPrayed) {
      setLoading(true);
      try {
        // First check if interaction already exists to prevent duplicates
        const { data: existingInteraction } = await supabase
          .from('prayer_interactions')
          .select('id')
          .eq('prayer_id', prayer.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingInteraction) {
          setHasPrayed(true);
          return;
        }

        const { error } = await supabase
          .from('prayer_interactions')
          .insert({
            prayer_id: prayer.id,
            user_id: user?.id
          })
          .select()
          .single();

        if (error) throw error;

        setHasPrayed(true);
        onPrayerCountUpdate(prayer.id);
        
        toast({
          title: "Prayer recorded",
          description: "Thank you for praying for this request.",
        });
      } catch (error) {
        console.error("Error recording prayer:", error);
        toast({
          title: "Error recording prayer",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCategory = (content) => {
    // Simple category detection based on content keywords
    const categories = {
      'health': ['health', 'healing', 'surgery', 'hospital', 'sick', 'recovery'],
      'family': ['family', 'marriage', 'children', 'parents', 'relationship'],
      'guidance': ['guidance', 'wisdom', 'decision', 'direction'],
      'praise': ['praise', 'thankful', 'grateful', 'blessing', 'answered'],
      'ministry': ['ministry', 'church', 'outreach', 'mission', 'service']
    };

    const lowerContent = content.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return category.charAt(0).toUpperCase() + category.slice(1);
      }
    }
    
    return 'General';
  };

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-church-500">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{prayer.author_name || 'Anonymous'}</span>
          </div>
          <span className="inline-block px-3 py-1 bg-church-100 text-church-600 rounded-full text-xs">
            {getCategory(prayer.content)}
          </span>
        </div>
        <h3 className="font-medium text-lg text-church-800 mb-2">{prayer.title}</h3>
        <p className="text-church-600 mb-4">{prayer.content}</p>
        <div className="flex items-center justify-between text-sm text-church-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatTimestamp(prayer.created_at)}
          </div>
          <Button
            variant="ghost" 
            size="sm" 
            className={`gap-2 ${hasPrayed ? 'text-church-300' : 'text-church-600 hover:text-church-800'}`}
            onClick={handlePrayerClick}
            disabled={hasPrayed || loading}
          >
            <Heart className={`w-4 h-4 ${hasPrayed ? 'fill-church-300' : ''}`} />
            {prayer.prayer_count} Prayers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PrayerWall = () => {
  const [prayers, setPrayers] = useState([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    totalCount: 0,
    prayerWarriors: 0,
    answeredCount: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrayers();
    fetchStats();
  }, []);

  const fetchPrayers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("prayers")
        .select(`
          id,
          title,
          content,
          author_name,
          prayer_count,
          created_at,
          status
        `)
        .eq("is_public", true)
        .eq("show_on_wall", true)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Fetched prayers:", data);
      setPrayers(data);
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

  const fetchStats = async () => {
    try {
      // Get today's prayer count
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayCount } = await supabase
        .from('prayer_interactions')
        .select('id', { count: 'exact' })
        .gte('created_at', today.toISOString());

      // Get total prayers count
      const { count: totalCount } = await supabase
        .from('prayers')
        .select('id', { count: 'exact' })
        .eq('is_public', true)
        .eq('show_on_wall', true);

      // Get unique prayer warriors count
      const { count: warriorsCount } = await supabase
        .from('prayer_interactions')
        .select('user_id', { count: 'exact', distinct: true });

      // Get answered prayers count
      const { count: answeredCount } = await supabase
        .from('prayers')
        .select('id', { count: 'exact' })
        .eq('status', 'completed');

      setStats({
        todayCount: todayCount || 0,
        totalCount: totalCount || 0,
        prayerWarriors: warriorsCount || 0,
        answeredCount: answeredCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handlePrayerCountUpdate = async (prayerId) => {
    const updatedPrayers = prayers.map(prayer => {
      if (prayer.id === prayerId) {
        return { ...prayer, prayer_count: prayer.prayer_count + 1 };
      }
      return prayer;
    });
    setPrayers(updatedPrayers);
    await fetchStats();
  };

  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">Prayer Wall</h1>
            <p className="text-xl text-church-600">Join us in lifting up one another in prayer</p>
          </div>

          {/* Prayer Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-display text-church-800 mb-1">{stats.todayCount}</div>
                <div className="text-sm text-church-600">Prayers Today</div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-display text-church-800 mb-1">{stats.totalCount}</div>
                <div className="text-sm text-church-600">Total Prayers</div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-display text-church-800 mb-1">{stats.prayerWarriors}</div>
                <div className="text-sm text-church-600">Prayer Warriors</div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-display text-church-800 mb-1">{stats.answeredCount}</div>
                <div className="text-sm text-church-600">Answered Prayers</div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Prayer Button */}
          <div className="text-center mb-12">
            <Button asChild className="bg-church-600 hover:bg-church-700">
              <Link to="/prayer-request">
              Share Your Prayer Request
              </Link>
            </Button>
          </div>

          {/* Prayer List */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8 text-church-600">Loading prayers...</div>
            ) : prayers.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-xl font-display text-church-800 mb-2">No Public Prayers Yet</h3>
                <p className="text-church-600 mb-4">Be the first to share a prayer request with our community.</p>
                <Button asChild className="bg-church-600 hover:bg-church-700">
                  <Link to="/prayer-request">Share Your Prayer Request</Link>
                </Button>
              </div>
            ) : (
              prayers.map((prayer) => (
                <PrayerCard 
                  key={prayer.id} 
                  prayer={prayer}
                  onPrayerCountUpdate={handlePrayerCountUpdate}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerWall;