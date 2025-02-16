
import { ChevronDown, Clock, MapPin, Heart, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-church-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center px-4">
        <div className={`space-y-6 max-w-4xl mx-auto ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
          <span className="inline-block px-4 py-2 bg-church-100 text-church-800 rounded-full text-sm font-body">
            Welcome to Our Community
          </span>
          <h1 className="text-5xl md:text-7xl font-display text-church-900 leading-tight">
            Where Faith Meets Community
          </h1>
          <p className="text-xl text-church-700 font-body max-w-2xl mx-auto">
            Join us in creating a warm, inclusive space where everyone is welcome to explore faith and find community.
          </p>
          <button className="mt-8 px-8 py-4 bg-church-800 text-white rounded-full font-body hover:bg-church-700 transition-colors">
            Join Us This Sunday
          </button>
        </div>
        <div className="absolute bottom-10 w-full text-center">
          <ChevronDown className="w-6 h-6 mx-auto text-church-400 animate-bounce" />
        </div>
      </section>

      {/* Service Times Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-church-500 font-body uppercase tracking-wider text-sm">Service Times</span>
            <h2 className="mt-4 text-4xl font-display text-church-900">Join Us in Worship</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-church-50 hover:shadow-lg transition-shadow">
              <Clock className="w-10 h-10 text-church-500 mb-4" />
              <h3 className="text-2xl font-display text-church-800 mb-2">Sunday Services</h3>
              <p className="text-church-600 font-body">9:00 AM - Morning Worship</p>
              <p className="text-church-600 font-body">11:00 AM - Contemporary Service</p>
            </div>
            <div className="p-8 rounded-2xl bg-church-50 hover:shadow-lg transition-shadow">
              <MapPin className="w-10 h-10 text-church-500 mb-4" />
              <h3 className="text-2xl font-display text-church-800 mb-2">Location</h3>
              <p className="text-church-600 font-body">123 Faith Street</p>
              <p className="text-church-600 font-body">Your City, State 12345</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-church-100">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-church-500 font-body uppercase tracking-wider text-sm">Our Values</span>
            <h2 className="mt-4 text-4xl font-display text-church-900">What We Stand For</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Heart className="w-12 h-12 text-church-500 mx-auto mb-4" />
              <h3 className="text-xl font-display text-church-800 mb-2">Love & Community</h3>
              <p className="text-church-600 font-body">Fostering meaningful connections and supporting one another.</p>
            </div>
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-church-500 mx-auto mb-4" />
              <h3 className="text-xl font-display text-church-800 mb-2">Faith & Learning</h3>
              <p className="text-church-600 font-body">Growing together through scripture and shared wisdom.</p>
            </div>
            <div className="text-center">
              <Heart className="w-12 h-12 text-church-500 mx-auto mb-4" />
              <h3 className="text-xl font-display text-church-800 mb-2">Service & Outreach</h3>
              <p className="text-church-600 font-body">Making a positive impact in our community and beyond.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <span className="text-church-500 font-body uppercase tracking-wider text-sm">Get in Touch</span>
          <h2 className="mt-4 text-4xl font-display text-church-900 mb-8">We'd Love to Hear from You</h2>
          <div className="bg-church-50 p-8 rounded-2xl">
            <p className="text-church-700 font-body mb-6">
              Have questions? Want to learn more about our community? We're here to help.
            </p>
            <button className="px-8 py-4 bg-church-800 text-white rounded-full font-body hover:bg-church-700 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
