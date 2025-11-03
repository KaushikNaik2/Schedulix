import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, Clock, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function AnnouncementSection({ userRole = "student" }) {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    const mockAnnouncements = [
      {
        id: 1,
        title: "New Faculty Registration Process",
        message: "Faculty members can now register through the admin portal. Contact IT support for access.",
        author: "Admin",
        createdAt: new Date().toISOString(),
        priority: "high"
      },
      {
        id: 2,
        title: "Meeting Request System Update",
        message: "Students can now schedule meetings with real-time availability checking. Check faculty timetables before requesting.",
        author: "Dr. Riya Sharma",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        priority: "medium"
      },
      {
        id: 3,
        title: "Timetable Upload Feature",
        message: "Faculty can upload Excel timetables for automatic availability tracking. Upload your schedules to help students book meetings efficiently.",
        author: "Prof. Aarav Mehta",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        priority: "low"
      }
    ];
    
    setTimeout(() => {
      setAnnouncements(mockAnnouncements);
      setIsLoading(false);
    }, 500);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className="border-none shadow-xl rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-poppins">
          <Megaphone className="w-6 h-6 text-[#9B8CFF]" />
          Latest Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-gradient-to-r from-[#C8B6FF]/5 to-[#A8C7FF]/5">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-4 rounded-2xl bg-gradient-to-r from-[#C8B6FF]/5 to-[#A8C7FF]/5 hover:from-[#C8B6FF]/10 hover:to-[#A8C7FF]/10 transition-all hover-lift"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8B6FF] to-[#A8C7FF] flex items-center justify-center">
                      <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg font-poppins">
                        {announcement.title}
                      </h3>
                      <Badge className={`text-xs rounded-full ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3 leading-relaxed">
                  {announcement.message}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{announcement.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(announcement.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              className="w-full rounded-full bg-gradient-to-r from-[#9B8CFF] to-[#89BFFF] hover:opacity-90 shadow-lg"
            >
              View All Announcements
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No announcements available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}