import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, Calendar, Share2, Facebook, Twitter, Mail, Link as LinkIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const Devotional = () => {
  const { id } = useParams();
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(true);
  const shareUrl = window.location.href;

  const handleShare = async (platform: string) => {
    const shareTitle = devotional?.title;
    const shareText = `${devotional?.verse_reference}: ${devotional?.verse_text}`;

    try {
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
          break;
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nRead more: ${shareUrl}`)}`;
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link copied",
            description: "The devotional link has been copied to your clipboard.",
          });
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
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error sharing",
        description: "There was an error sharing this devotional.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDevotional();
  }, [id]);

  const fetchDevotional = async () => {
    try {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setDevotional(data);
    } catch (error) {
      console.error("Error fetching devotional:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-church-50">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!devotional) {
    return (
      <div className="min-h-screen bg-church-50">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-2xl font-display text-church-800 mb-4">Devotional Not Found</h1>
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button 
            variant="ghost" 
            className="mb-6"
            asChild
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <Card className="bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <Bookmark className="w-8 h-8 text-church-600" />
                <div>
                  <h1 className="text-3xl font-display text-church-800">{devotional.title}</h1>
                  <div className="flex items-center gap-2 text-church-500 mt-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(devotional.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>

              <blockquote className="bg-church-50 p-6 rounded-lg mb-8 italic">
                {devotional.verse_text}
                <cite className="block text-sm mt-2 text-church-500 not-italic">
                  - {devotional.verse_reference}
                </cite>
              </blockquote>

              <div className="prose prose-lg max-w-none">
                {devotional.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-church-600 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-church-600">Share this devotional:</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700"
                      onClick={() => handleShare('facebook')}
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Share on Facebook</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-sky-500 hover:text-sky-600"
                      onClick={() => handleShare('twitter')}
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Share on Twitter</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-gray-600 hover:text-gray-700"
                      onClick={() => handleShare('email')}
                    >
                      <Mail className="h-4 w-4" />
                      <span className="sr-only">Share via Email</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-church-600 hover:text-church-700"
                      onClick={() => handleShare('copy')}
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span className="sr-only">Copy Link</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Devotional;