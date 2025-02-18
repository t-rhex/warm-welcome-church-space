
import Navigation from "../components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">Our Church</h1>
            <p className="text-xl text-church-600">We are a church that believes in Jesus & loves God and people</p>
          </div>
          
          <div className="grid gap-12 md:grid-cols-2 mt-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-display text-church-800">Our Vision</h2>
              <p className="text-church-600">
                We are a multi-cultural and multi-generational church committed to reaching the city of Woodbury and Beyond. 
                We exist to help you and your family grow closer to your God-given purpose. Everyone has a first step to take 
                in their journey. Will you take your first step this Sunday?
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-display text-church-800">Our Pastors</h2>
              <p className="text-church-600">
                David and Neelu are the Founding Pastors of Revival Center Minnesota Church. Both came from Hindu families in South India. 
                Soon after their encounter with the Living God Jesus Christ, God called them into full-time ministry. Together, they have 
                served in church and ministry, for around 20 years, and 18 years ago God called David to be a missionary to the USA.
              </p>
              <p className="text-church-600">
                After their marriage, both traveled to different parts of the USA ministering to ethnic churches like Russians/Ukrainians, 
                Armenians, Ethiopians, South Sudanese, Koreans, Hmong, Messianic Jews, Nepali/Bhutanese, Indians, Hispanics, and Americans. 
                The Lord planted within David and Neelu's heart, the vision to plant a Church in Minnesota to reach ALL PEOPLE GROUPS with 
                the LOVE and HOPE of Lord Jesus Christ. Pastor David is a graduate of Victory Bible College & Victory Missions from Tulsa, OK.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
