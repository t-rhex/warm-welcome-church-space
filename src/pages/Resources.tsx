import Navigation from "../components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, Users, Baby, Church } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const resources = [
  {
    category: "Forms",
    items: [
      {
        title: "Baptism Registration",
        description: "Request form for baptism services",
        icon: Baby,
        type: "PDF",
        updated: "2024-03-01"
      },
      {
        title: "Event Request Form",
        description: "Form to request facility usage for events",
        icon: Calendar,
        type: "PDF",
        updated: "2024-03-15"
      },
      {
        title: "Membership Application",
        description: "Application for church membership",
        icon: Users,
        type: "PDF",
        updated: "2024-02-28"
      },
      {
        title: "Wedding Request Form",
        description: "Request form for wedding ceremonies",
        icon: Church,
        type: "PDF",
        updated: "2024-03-10"
      }
    ]
  },
  {
    category: "Bulletins & Newsletters",
    items: [
      {
        title: "Weekly Bulletin",
        description: "Current week's announcements and order of service",
        icon: FileText,
        type: "PDF",
        updated: "2024-03-24"
      },
      {
        title: "Monthly Newsletter",
        description: "March 2024 church newsletter",
        icon: FileText,
        type: "PDF",
        updated: "2024-03-01"
      }
    ]
  },
  {
    category: "Study Materials",
    items: [
      {
        title: "Bible Study Guide",
        description: "Current sermon series study guide",
        icon: FileText,
        type: "PDF",
        updated: "2024-03-20"
      },
      {
        title: "Small Group Materials",
        description: "Resources for small group leaders",
        icon: FileText,
        type: "PDF",
        updated: "2024-03-15"
      }
    ]
  }
];

const Resources = () => {
  return (
    <div className="min-h-screen bg-church-50">
      <Navigation />
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display text-church-900 mb-4">Resources</h1>
            <p className="text-xl text-church-600">Download forms, bulletins, and study materials</p>
          </div>

          <div className="space-y-12">
            {resources.map((section) => (
              <div key={section.category}>
                <h2 className="text-2xl font-display text-church-800 mb-6">{section.category}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item) => (
                    <Card key={item.title} className="bg-white hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-church-100">
                            <item.icon className="w-6 h-6 text-church-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-display text-lg text-church-800">{item.title}</h3>
                              <Badge variant="secondary" className="bg-church-100 text-church-600">
                                {item.type}
                              </Badge>
                            </div>
                            <p className="text-church-600 text-sm mb-4">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-church-500">
                                Updated: {new Date(item.updated).toLocaleDateString()}
                              </span>
                              <Button variant="ghost" size="sm" className="text-church-600 hover:text-church-800">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;