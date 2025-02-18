import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpenCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ScriptureOfWeek = () => {
  const [scripture, setScripture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentScripture();
  }, []);

  const fetchCurrentScripture = async () => {
    try {
      const { data, error } = await supabase
        .from("scriptures")
        .select("*")
        .eq("status", "active")
        .lte("start_date", new Date().toISOString())
        .gte("end_date", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching scripture:", error);
        return;
      }

      if (data && data.length > 0) {
        setScripture(data[0]);
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

  if (!scripture) {
    return null;
  }

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <BookOpenCheck className="w-8 h-8 text-church-600" />
          <h3 className="text-xl sm:text-2xl font-display text-church-800">Scripture of the Week</h3>
        </div>
        <blockquote className="text-lg sm:text-2xl font-display text-church-700 mb-6 leading-relaxed italic">
          {scripture.verse_text}
        </blockquote>
        <cite className="text-church-600 text-base sm:text-lg block">
          - {scripture.verse_reference}
        </cite>
      </CardContent>
    </Card>
  );
};

export default ScriptureOfWeek;