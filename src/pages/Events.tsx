
import Navigation from "../components/Navigation";

const Events = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-5xl font-display text-church-900 mb-8">Upcoming Events</h1>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Example Event Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="text-church-500 font-body mb-2">Sunday, March 24th</div>
              <h3 className="text-2xl font-display text-church-800 mb-2">Easter Service</h3>
              <p className="text-church-600">Join us for a special Easter celebration service with music and fellowship.</p>
            </div>
            {/* Add more event cards as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
