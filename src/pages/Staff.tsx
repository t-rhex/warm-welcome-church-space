import Navigation from "../components/Navigation";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";

const staffMembers = [
  {
    name: "Pastor John Smith",
    role: "Senior Pastor",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    bio: "Pastor John has been leading our church for over 15 years with wisdom and compassion.",
    email: "pastor.john@gracechurch.com",
    phone: "(555) 123-4567"
  },
  {
    name: "Sarah Johnson",
    role: "Youth Pastor",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    bio: "Sarah leads our vibrant youth ministry with energy and dedication.",
    email: "sarah.j@gracechurch.com",
    phone: "(555) 123-4568"
  },
  {
    name: "Michael Chen",
    role: "Worship Director",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    bio: "Michael brings a passion for worship and musical excellence to our services.",
    email: "michael.c@gracechurch.com",
    phone: "(555) 123-4569"
  }
];

const Staff = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">Our Staff</h1>
            <p className="text-xl text-church-600">Meet the dedicated team serving our community</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {staffMembers.map((staff) => (
              <Card key={staff.name} className="bg-white">
                <CardHeader>
                  <div className="aspect-square w-48 mx-auto mb-4 overflow-hidden rounded-full">
                    <img 
                      src={staff.image} 
                      alt={staff.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-display text-church-800 text-center">{staff.name}</h3>
                  <CardDescription className="text-center">{staff.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-church-600 mb-6 text-center">{staff.bio}</p>
                  <div className="space-y-2">
                    <a href={`mailto:${staff.email}`} className="flex items-center gap-2 text-church-600 hover:text-church-800">
                      <Mail className="w-4 h-4" />
                      {staff.email}
                    </a>
                    <a href={`tel:${staff.phone}`} className="flex items-center gap-2 text-church-600 hover:text-church-800">
                      <Phone className="w-4 h-4" />
                      {staff.phone}
                    </a>
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

export default Staff;