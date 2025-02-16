
import Navigation from "../components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">About Our Church</h1>
            <p className="text-xl text-church-600">A community built on faith, love, and fellowship</p>
          </div>
          
          <div className="grid gap-12 md:grid-cols-2 mt-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-display text-church-800">Our Story</h2>
              <p className="text-church-600">
                Founded in 1985, our church has been a beacon of hope and community in our area. 
                We believe in creating an inclusive environment where everyone can explore their faith 
                and find meaningful connections.
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-display text-church-800">Our Mission</h2>
              <p className="text-church-600">
                We are committed to spreading God's love through worship, education, and service. 
                Our mission is to create a community where faith grows and relationships flourish.
              </p>
            </div>
          </div>

          <div className="mt-20 bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-3xl font-display text-church-800 mb-8 text-center">Our Core Values</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <h3 className="text-xl font-display text-church-700 mb-2">Faith</h3>
                <p className="text-church-600">Grounded in biblical truth and spiritual growth</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-display text-church-700 mb-2">Community</h3>
                <p className="text-church-600">Building meaningful relationships and support</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-display text-church-700 mb-2">Service</h3>
                <p className="text-church-600">Reaching out to help those in need</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
