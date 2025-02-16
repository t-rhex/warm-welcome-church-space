
import Navigation from "../components/Navigation";

const Give = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-display text-church-900 mb-8">Support Our Mission</h1>
          <p className="text-xl text-church-600 mb-12">Your generosity helps us continue our work in the community.</p>
          <div className="grid gap-8 md:grid-cols-2">
            <button className="p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-display text-church-800 mb-4">One-Time Gift</h3>
              <p className="text-church-600">Make a one-time donation to support our ministry</p>
            </button>
            <button className="p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-display text-church-800 mb-4">Recurring Gift</h3>
              <p className="text-church-600">Set up a recurring donation to provide sustained support</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Give;
