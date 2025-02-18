import Navigation from "../components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Sermons = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl font-display text-church-900 mb-4">Sermon Library</h1>
              <p className="text-xl text-church-600">Watch or listen to our latest messages</p>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-church-400" />
              <Input 
                placeholder="Search sermons..." 
                className="pl-10 bg-white"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Featured Sermon */}
            <Card className="col-span-full bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-display">Latest Message</CardTitle>
                <CardDescription>March 17, 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-church-100 rounded-lg mb-4"></div>
                <h3 className="text-xl font-display text-church-800 mb-2">Walking in Faith</h3>
                <p className="text-church-600">Pastor John Smith explores the fundamentals of faith and its practical application in our daily lives.</p>
              </CardContent>
            </Card>

            {/* Recent Sermons */}
            {[1, 2, 3, 4, 5, 6].map((sermon) => (
              <Card key={sermon} className="bg-white">
                <CardHeader>
                  <CardDescription>March {sermon + 10}, 2024</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-church-100 rounded-lg mb-4"></div>
                  <h3 className="text-lg font-display text-church-800 mb-2">Sunday Service</h3>
                  <p className="text-church-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sermons;