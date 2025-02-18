import Navigation from "@/components/Navigation";
import ChurchSchedule from "@/components/ChurchSchedule";

const Schedule = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">Church Schedule</h1>
            <p className="text-xl text-church-600">Join us throughout the week</p>
          </div>
          
          <ChurchSchedule />
        </div>
      </div>
    </div>
  );
};

export default Schedule;