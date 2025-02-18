import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const ConnectionCard = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    is_first_time: false,
    how_did_you_hear: "",
    prayer_request: "",
    interested_in: [] as string[],
    visit_type: "first-time",
    preferred_contact: "email"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('connection_cards')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Thank you for connecting with us!",
        description: "We'll be in touch with you soon.",
      });

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        is_first_time: false,
        how_did_you_hear: "",
        prayer_request: "",
        interested_in: [],
        visit_type: "first-time",
        preferred_contact: "email"
      });
    } catch (error) {
      toast({
        title: "Error submitting form",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const interestOptions = [
    "Accepting Christ",
    "Baptism",
    "Small Groups",
    "Serving",
    "Children's Ministry",
    "Youth Ministry",
    "Prayer Ministry",
    "Worship Team",
    "Bible Study"
  ];

  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">Connect With Us</h1>
            <p className="text-xl text-church-600">We'd love to get to know you better</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connection Card</CardTitle>
              <CardDescription>Please fill out this form to help us connect with you</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address</h3>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zip_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Visit Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Visit Information</h3>
                  <div className="space-y-2">
                    <Label>Type of Visit</Label>
                    <RadioGroup
                      value={formData.visit_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, visit_type: value }))}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="first-time" id="first-time" />
                        <Label htmlFor="first-time">First Time Guest</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="returning" id="returning" />
                        <Label htmlFor="returning">Returning Guest</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="regular" id="regular" />
                        <Label htmlFor="regular">Regular Attendee</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="howDidYouHear">How did you hear about us?</Label>
                    <Input
                      id="howDidYouHear"
                      value={formData.how_did_you_hear}
                      onChange={(e) => setFormData(prev => ({ ...prev, how_did_you_hear: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">I'm interested in...</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {interestOptions.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest}
                          checked={formData.interested_in.includes(interest)}
                          onCheckedChange={(checked) => {
                            setFormData(prev => ({
                              ...prev,
                              interested_in: checked
                                ? [...prev.interested_in, interest]
                                : prev.interested_in.filter(i => i !== interest)
                            }));
                          }}
                        />
                        <Label htmlFor={interest}>{interest}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prayer Request */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Prayer Request</h3>
                  <div className="space-y-2">
                    <Label htmlFor="prayerRequest">How can we pray for you?</Label>
                    <Textarea
                      id="prayerRequest"
                      value={formData.prayer_request}
                      onChange={(e) => setFormData(prev => ({ ...prev, prayer_request: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Preferred Contact Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preferred Contact Method</h3>
                  <RadioGroup
                    value={formData.preferred_contact}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_contact: value }))}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="contact-email" />
                      <Label htmlFor="contact-email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phone" id="contact-phone" />
                      <Label htmlFor="contact-phone">Phone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="contact-text" />
                      <Label htmlFor="contact-text">Text Message</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-church-600 hover:bg-church-700"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConnectionCard;