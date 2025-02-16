
import Navigation from "../components/Navigation";

const Contact = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">Get in Touch</h1>
            <p className="text-xl text-church-600">We'd love to hear from you</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <form className="space-y-6">
              <div>
                <label className="block text-church-600 mb-2">Name</label>
                <input type="text" className="w-full p-3 border border-church-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-church-600 mb-2">Email</label>
                <input type="email" className="w-full p-3 border border-church-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-church-600 mb-2">Message</label>
                <textarea className="w-full p-3 border border-church-200 rounded-lg h-32"></textarea>
              </div>
              <button className="w-full py-4 bg-church-600 text-white rounded-lg hover:bg-church-700 transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
