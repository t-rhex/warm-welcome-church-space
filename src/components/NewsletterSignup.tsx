import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic email validation
      if (!email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
        throw new Error("Please enter a valid email address");
      }

      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([
          { 
            email,
            source: 'website_footer',
            ip_address: '', // We don't collect IP for privacy
          }
        ]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to our newsletter.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Subscription Successful",
          description: "Thank you for subscribing to our newsletter!",
        });
        setEmail("");
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-church-700 border-church-600 text-white placeholder:text-church-400"
        required
      />
      <Button 
        type="submit"
        className="bg-church-600 hover:bg-church-500"
        disabled={loading}
      >
        {loading ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
};

export default NewsletterSignup;