// src/pages/Dashboard.jsx - UPDATED with "View All" Links
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import { Calendar, Users, Clock, CheckCircle2, ArrowRight, MessageSquareText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Message from "../components/Message";
import { format } from 'date-fns'; // <-- 1. IMPORT format

// Define backend base URL for images
const BACKEND_BASE_URL = 'http://localhost:8080';

export default function StudentDashboard() { // Renamed to StudentDashboard
  const { user } = useAuth();
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [message, setMessage] = useState({ type: null, text: '' });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: '' }), 5000);
  }, []);

  const loadMeetings = useCallback(async () => {
    setLoadingMeetings(true);
    try {
      const meetingsData = await apiService.getMyStudentRequests();
      const confirmedUpcoming = (Array.isArray(meetingsData) ? meetingsData : [])
        .filter(m => m.status === 'APPROVED');
      setUpcomingMeetings(confirmedUpcoming.slice(0, 5));
    } catch (error) {
      console.error("Error loading student meetings:", error);
      showMessage('error', `Failed to load meetings: ${error.message}`);
    } finally {
      setLoadingMeetings(false);
    }
  }, [showMessage]);

  const loadAnnouncements = useCallback(async () => {
    setLoadingAnnouncements(true);
    try {
      const announcementsData = await apiService.getAnnouncements();
      setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
    } catch (error) {
      console.error("Error loading announcements:", error);
      showMessage('error', `Failed to load announcements: ${error.message}`);
    } finally {
      setLoadingAnnouncements(false);
    }
  }, [showMessage]);

  useEffect(() => {
    if (user) {
      loadMeetings();
      loadAnnouncements();
    }
  }, [user, loadMeetings, loadAnnouncements]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="space-y-8">
      <Message message={message} />

      {/* Greeting Banner */}
      <div className="gradient-border p-8 hover-lift rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-poppins mb-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent">
              {getGreeting()}, {user.fullName || user.username || 'Student'}!
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome to Schedulix - Faculty Coordination App
            </p>
          </div>
          <div className="hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop"
              alt="Campus"
              className="w-64 h-40 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/availability" className="group">
          <Card className="border-none shadow-xl hover-lift bg-gradient-to-br from-[#2563EB]/10 to-white rounded-3xl overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8B6FF]/20 rounded-full -mr-16 -mt-16" />
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-poppins">Faculty Availability</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-gray-600 mb-4">
                Check faculty schedules before requesting a meeting
              </p>
              <Button className="w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 shadow-lg text-white">
                Check Availability <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        <Link to="/schedule" className="group">
          <Card className="border-none shadow-xl hover-lift bg-gradient-to-br from-[#A8C7FF]/10 to-white rounded-3xl overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A8C7FF]/20 rounded-full -mr-16 -mt-16" />
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-poppins">Schedule a Meeting</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-gray-600 mb-4">
                Book appointments with faculty members
              </p>
              <Button className="w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 shadow-lg text-white">
                Book Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Announcements Section - Fetching real data */}
      <Card className="border-none shadow-xl rounded-3xl">
        <CardHeader>
          {/* --- 2. ADDED "View All" LINK HERE --- */}
          <CardTitle className="flex items-center justify-between text-2xl font-poppins">
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-6 h-6 text-[#2563EB]" />
              Latest Announcements
            </div>
            <Link to="/announcements">

            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAnnouncements ? (
            <p>Loading announcements...</p>
          ) : announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.slice(0, 3).map((announcement) => (
                <div key={announcement.id} className="p-4 rounded-2xl bg-gray-50 border">
                  <h4 className="font-semibold text-lg">{announcement.title}</h4>
                  <p className="text-sm text-gray-600 mb-1">{announcement.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Posted by {announcement.facultyName} on {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}

              {announcements.length > 3 && (
                <div className="text-center mt-4">
                  <Link to="/announcements">
                    <Button className="w-full max-w-xs mx-auto rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 shadow-lg text-white font-semibold">
                      View All Announcements &rarr;
                    </Button>
                  </Link>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquareText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No announcements posted yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Confirmed Meetings (Using real data) */}
      <Card className="border-none shadow-xl rounded-3xl">
        <CardHeader>
          {/* --- 3. ADDED "View All" LINK HERE --- */}
          <CardTitle className="flex items-center justify-between text-2xl font-poppins">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#7C3AED]" />
              Upcoming Confirmed Meetings
            </div>
            <Link to="/student/meetings"> {/* Links to the "My Requests" page */}
              <Button className="w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 shadow-lg text-white">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMeetings ? (
            <p>Loading meetings...</p>
          ) : upcomingMeetings.length > 0 ? (
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#C8B6FF]/5 to-[#A8C7FF]/5 hover:from-[#C8B6FF]/10 hover:to-[#A8C7FF]/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                      {meeting.facultyProfileImageUrl ? (
                        <img
                          src={`${BACKEND_BASE_URL}${meeting.facultyProfileImageUrl}`}
                          alt={meeting.facultyName}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.outerHTML = `<span class="text-xl font-bold">${getInitials(meeting.facultyName)}</span>`; }}
                        />
                      ) : (
                        getInitials(meeting.facultyName) // Fallback to initials
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{meeting.facultyName}</p>
                      <p className="text-sm text-gray-600">{meeting.topic}</p>
                    </div>
                  </div>

                  {/* --- 4. ADDED DATE/TIME DISPLAY --- */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-gray-700">
                      {meeting.meetingDate ? format(new Date(meeting.meetingDate), "MMM d, yyyy") : 'No Date'}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      {meeting.meetingTime ? meeting.meetingTime.substring(0, 5) : 'No Time'}
                    </p>
                    <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      Approved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No upcoming confirmed meetings</p>
              <Link to="/schedule">
                <Button className="mt-4 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">
                  Schedule a Meeting
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* <Chatbot /> */} {/* Keep if needed */}
    </div>
  );
}