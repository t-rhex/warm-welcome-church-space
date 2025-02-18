import Navigation from "../components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Baby, Coffee, ParkingMeter as Parking, Users } from "lucide-react";

const PlanVisit = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">Plan Your Visit</h1>
            <p className="text-xl text-church-600">We can't wait to meet you</p>
          </div>

          {/* What to Expect Section */}
          <div className="grid gap-8 mb-16">
            <Card className="bg-white">
              <CardContent className="p-8">
                <h2 className="text-3xl font-display text-church-800 mb-6">What to Expect</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <Clock className="w-6 h-6 text-church-600 shrink-0" />
                      <div>
                        <h3 className="font-display text-xl text-church-800 mb-2">Service Times</h3>
                        <p className="text-church-600">Service times coming soon</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Coffee className="w-6 h-6 text-church-600 shrink-0" />
                      <div>
                        <h3 className="font-display text-xl text-church-800 mb-2">Fellowship</h3>
                        <p className="text-church-600">Join us for coffee and refreshments before and after services</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Baby className="w-6 h-6 text-church-600 shrink-0" />
                      <div>
                        <h3 className="font-display text-xl text-church-800 mb-2">Children's Ministry</h3>
                        <p className="text-church-600">Safe and engaging programs for kids of all ages</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <Parking className="w-6 h-6 text-church-600 shrink-0" />
                      <div>
                        <h3 className="font-display text-xl text-church-800 mb-2">Parking</h3>
                        <p className="text-church-600">Free parking available in our main lot</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Users className="w-6 h-6 text-church-600 shrink-0" />
                      <div>
                        <h3 className="font-display text-xl text-church-800 mb-2">Community</h3>
                        <p className="text-church-600">Friendly greeters will help you find your way</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Section */}
          <div className="grid gap-8">
            <Card className="bg-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <MapPin className="w-8 h-8 text-church-600" />
                  <div>
                    <h2 className="text-3xl font-display text-church-800 mb-2">Location</h2>
                    <p className="text-church-600">Location details coming soon</p>
                  </div>
                </div>
                <div className="aspect-video bg-church-100 rounded-lg mb-6"></div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 bg-church-600 hover:bg-church-700">
                    Get Directions
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanVisit;