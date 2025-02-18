import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Search, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DevotionalsArchive = () => {
  const [devotionals, setDevotionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDevotionals();
  }, []);

  const fetchDevotionals = async () => {
    try {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDevotionals(data || []);
    } catch (error) {
      console.error("Error fetching devotionals:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevotionals = devotionals.filter(devotional => {
    const searchLower = searchQuery.toLowerCase();
    return (
      devotional.title.toLowerCase().includes(searchLower) ||
      devotional.content.toLowerCase().includes(searchLower) ||
      devotional.verse_reference.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-display text-church-900 mb-4 text-center sm:text-left">Daily Devotionals</h1>
              <p className="text-xl text-church-600">Browse our collection of daily devotionals</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-church-400" />
              <Input 
                placeholder="Search devotionals..." 
                className="pl-10 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading devotionals...</div>
          ) : filteredDevotionals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bookmark className="w-12 h-12 text-church-400 mx-auto mb-4" />
                <h3 className="text-xl font-display text-church-800 mb-2">No Devotionals Found</h3>
                <p className="text-church-600">Try adjusting your search terms</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredDevotionals.map((devotional) => (
                <Card key={devotional.id} className="bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-church-500 text-sm mb-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(devotional.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <h3 className="text-xl font-display text-church-800 mb-2">{devotional.title}</h3>
                        <blockquote className="border-l-4 border-church-200 pl-4 mb-4 italic">
                          {devotional.verse_text}
                          <cite className="block text-sm mt-1 text-church-500 not-italic">
                            - {devotional.verse_reference}
                          </cite>
                        </blockquote>
                        <p className="text-church-600 mb-4">
                          {devotional.content.substring(0, 200)}...
                        </p>
                        <Button 
                          variant="outline" 
                          className="text-church-600 hover:text-church-800"
                          asChild
                        >
                          <Link to={`/devotionals/${devotional.id}`}>
                            Read Full Devotional →
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevotionalsArchive;