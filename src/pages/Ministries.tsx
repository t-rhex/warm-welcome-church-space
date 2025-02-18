import Navigation from "../components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Heart, BookOpen, Music, 
  Baby, GraduationCap, Globe, Coffee 
} from "lucide-react";

const ministries = [
  {
    title: "Community Groups",
    description: "Connect with others in small groups for fellowship, study, and support.",
    icon: Users,
    leader: "Sarah Johnson"
  },
  {
    title: "Children's Ministry",
    description: "Nurturing young hearts and minds in faith through engaging activities and biblical teaching.",
    icon: Baby,
    leader: "Emily Parker"
  },
  {
    title: "Youth Ministry",
    description: "Empowering teenagers to grow in their faith journey through fellowship and mentorship.",
    icon: GraduationCap,
    leader: "Mike Wilson"
  },
  {
    title: "Worship Ministry",
    description: "Leading our congregation in worship through music and creative arts.",
    icon: Music,
    leader: "David Chen"
  },
  {
    title: "Outreach & Missions",
    description: "Serving our local community and supporting global missions.",
    icon: Globe,
    leader: "John & Mary Smith"
  },
  {
    title: "Bible Study",
    description: "Deep dive into Scripture through various study groups and classes.",
    icon: BookOpen,
    leader: "Dr. Robert Brown"
  },
  {
    title: "Care Ministry",
    description: "Providing support and care for those in need within our church family.",
    icon: Heart,
    leader: "Lisa Anderson"
  },
  {
    title: "Welcome Team",
    description: "Creating a warm and welcoming environment for all who visit.",
    icon: Coffee,
    leader: "James Wilson"
  }
];

const Ministries = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">Our Ministries</h1>
            <p className="text-xl text-church-600">
              Discover ways to grow, serve, and connect within our church family
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ministries.map((ministry) => (
              <Card key={ministry.title} className="bg-white hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-church-100">
                      <ministry.icon className="w-6 h-6 text-church-600" />
                    </div>
                    <CardTitle className="text-xl">{ministry.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-church-600 mb-4">{ministry.description}</p>
                  <p className="text-sm text-church-500">
                    Led by: <span className="font-medium">{ministry.leader}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ministries;