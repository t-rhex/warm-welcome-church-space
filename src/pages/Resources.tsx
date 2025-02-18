import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Calendar,
  Users,
  Baby,
  Church,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  icon: string;
  type: string;
  updated_at: string;
}

const iconMap = {
  Baby,
  Calendar,
  Users,
  Church,
  FileText,
};

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("status", "active")
        .order("category");

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({
        title: "Error fetching resources",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while fetching resources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Group resources by category
  const groupedResources = resources.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">
              Resources
            </h1>
            <p className="text-xl text-church-600">
              Download forms, bulletins, and study materials
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading resources...</div>
          ) : resources.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-church-300 mx-auto mb-4" />
                <h3 className="text-xl font-display text-church-900 mb-2">
                  No Resources Available
                </h3>
                <p className="text-church-600">
                  Check back later for downloadable resources and materials.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedResources).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-2xl font-display text-church-800 mb-6">
                    {category}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => {
                      const IconComponent =
                        iconMap[item.icon as keyof typeof iconMap] || FileText;
                      return (
                        <Card
                          key={item.id}
                          className="bg-white hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="p-3 rounded-lg bg-church-100">
                                <IconComponent className="w-6 h-6 text-church-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h3 className="font-display text-lg text-church-800">
                                    {item.title}
                                  </h3>
                                  <Badge
                                    variant="secondary"
                                    className="bg-church-100 text-church-600">
                                    {item.type}
                                  </Badge>
                                </div>
                                <p className="text-church-600 text-sm mb-4">
                                  {item.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-church-500">
                                    Updated:{" "}
                                    {new Date(
                                      item.updated_at
                                    ).toLocaleDateString()}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-church-600 hover:text-church-800"
                                    onClick={() =>
                                      window.open(item.file_url, "_blank")
                                    }>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resources;
