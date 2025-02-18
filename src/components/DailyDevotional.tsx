import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DailyDevotional = () => {
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentDevotional();
  }, []);

  const fetchCurrentDevotional = async () => {
    try {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .eq("status", "active")
        .lte("start_date", new Date().toISOString())
        .gte("end_date", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching devotional:", error);
        return;
      }

      if (data && data.length > 0) {
        setDevotional(data[0]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!devotional) {
    return null;
  }

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Bookmark className="w-8 h-8 text-church-600" />
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-display text-church-800">Daily Devotional</h3>
            <p className="text-church-600">{new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
        <h4 className="text-lg sm:text-xl font-display text-church-800 mb-4">{devotional.title}</h4>
        <p className="text-church-600 mb-6">{devotional.content}</p>
        <blockquote className="border-l-4 border-church-200 pl-4 mb-6 italic">
          {devotional.verse_text}
          <cite className="block text-sm mt-2 text-church-500">- {devotional.verse_reference}</cite>
        </blockquote>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="text-church-600 hover:text-church-800"
            asChild
          >
            <Link to={`/devotionals/${devotional.id}`}>
            Read Full Devotional →
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="text-church-600 hover:text-church-800"
            asChild
          >
            <Link to="/devotionals">
            View All Devotionals →
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default DailyDevotional;