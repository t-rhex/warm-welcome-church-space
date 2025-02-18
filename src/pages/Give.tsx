
import Navigation from "../components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Give = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-display text-church-900 mb-8">Support Our Mission</h1>
          <p className="text-xl text-church-600 mb-12">Your generosity helps us continue our work in the community.</p>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-display text-church-800 mb-4">One-Time Gift</h3>
                <p className="text-church-600 mb-6">Make a one-time donation to support our ministry</p>
                <Button className="w-full bg-church-600 hover:bg-church-700">Give Now</Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-church-500 text-white px-4 py-1 rounded-bl-lg text-sm">
                Recommended
              </div>
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-display text-church-800 mb-4">Recurring Gift</h3>
                <p className="text-church-600 mb-6">Set up a recurring donation to provide sustained support</p>
                <Button className="w-full bg-church-600 hover:bg-church-700">Set Up Monthly Gift</Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-display text-church-800 mb-4">Special Projects</h3>
                <p className="text-church-600 mb-6">Support specific ministry initiatives and projects</p>
                <Button className="w-full bg-church-600 hover:bg-church-700">View Projects</Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Impact Section */}
          <div className="mt-16">
            <h3 className="text-2xl font-display text-church-800 text-center mb-8">Your Giving Makes a Difference</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-display text-church-600 mb-2">1,200+</div>
                <p className="text-church-500">People Served Monthly</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display text-church-600 mb-2">15</div>
                <p className="text-church-500">Community Programs</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display text-church-600 mb-2">100%</div>
                <p className="text-church-500">Funds to Ministry</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Give;
