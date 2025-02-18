import Navigation from "../components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const posts = [
  {
    title: "Easter Service Announcement",
    excerpt: "Join us for a special Easter celebration service with music and fellowship.",
    date: "March 24, 2024",
    eventDate: "March 31, 2024",
    eventId: "easter-2024",
    author: "Pastor John Smith",
    category: "Announcements",
    image: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    title: "Youth Camp Registration Now Open",
    excerpt: "Register your teens for our annual summer youth camp. Early bird discounts available.",
    date: "March 22, 2024",
    author: "Sarah Johnson",
    category: "Youth Ministry",
    image: "https://images.unsplash.com/photo-1526976668912-1a811878dd37?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    title: "Community Outreach Success",
    excerpt: "Thank you to all volunteers who participated in our recent community service day.",
    date: "March 20, 2024",
    author: "Mike Wilson",
    category: "News",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-display text-church-900 mb-4 text-center sm:text-left">News & Updates</h1>
              <p className="text-xl text-church-600">Stay informed about our church community</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-church-400" />
              <Input 
                placeholder="Search posts..." 
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Featured Post */}
          <Card className="mb-12 bg-white overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 md:h-auto">
                <img 
                  src={posts[0].image}
                  alt={posts[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 bg-church-100 text-church-600 rounded-full text-sm mb-4">
                  {posts[0].category}
                </span>
                <h2 className="text-3xl font-display text-church-900 mb-4">{posts[0].title}</h2>
                <p className="text-church-600 mb-6">{posts[0].excerpt}</p>
                {posts[0].eventDate && (
                  <Link 
                    to={`/events/${posts[0].eventId}`}
                    className="inline-flex items-center gap-2 text-church-600 hover:text-church-800 mb-4"
                  >
                    <Calendar className="w-4 h-4" />
                    View Event Details ({posts[0].eventDate})
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <div className="flex items-center gap-4 text-church-500">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {posts[0].date}
                  </span>
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {posts[0].author}
                  </span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Quick Links */}
          <div className="flex gap-4 mb-12">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/events">View All Events</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/sermons">Latest Sermons</Link>
            </Button>
          </div>

          {/* Recent Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post) => (
              <Card key={post.title} className="bg-white overflow-hidden">
                <div className="h-48">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <span className="inline-block px-3 py-1 bg-church-100 text-church-600 rounded-full text-sm mb-4">
                    {post.category}
                  </span>
                  <h3 className="text-xl font-display text-church-800 mb-3">{post.title}</h3>
                  <p className="text-church-600 mb-4">{post.excerpt}</p>
                  {post.eventDate && (
                    <Link 
                      to={`/events/${post.eventId}`}
                      className="inline-flex items-center gap-2 text-church-600 hover:text-church-800 mb-4"
                    >
                      <Calendar className="w-4 h-4" />
                      View Event Details ({post.eventDate})
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  <div className="flex items-center gap-4 text-church-500 text-sm">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {post.author}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;