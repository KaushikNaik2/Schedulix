// src/pages/Availability.jsx - UPDATED with Role-Based Button
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import apiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Message from "../components/Message";
import { Search, Briefcase, Calendar, BookOpen, MapPin, Circle, Edit } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const BACKEND_BASE_URL = 'http://localhost:8080';

export default function Availability() {
  const { user } = useAuth(); // <-- 3. GET LOGGED-IN USER
  const navigate = useNavigate(); // For navigation
  const [facultyList, setFacultyList] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: null, text: '' });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: '' }), 5000);
  }, []);

  const loadFaculty = useCallback(async () => {
    setIsLoading(true);
    setMessage({ type: null, text: '' });
    try {
      const data = await apiService.getFacultyList();
      const validData = Array.isArray(data) ? data : [];
      setFacultyList(validData);
      setFilteredFaculty(validData);
    } catch (error) {
      console.error("Error loading faculty:", error);
      showMessage('error', `Failed to load faculty list: ${error.message}`);
      setFacultyList([]);
      setFilteredFaculty([]);
    } finally {
      setIsLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadFaculty();
  }, [loadFaculty]);

  useEffect(() => {
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = facultyList.filter(f =>
        (f.fullName && f.fullName.toLowerCase().includes(lowerCaseQuery)) ||
        (f.username && f.username.toLowerCase().includes(lowerCaseQuery)) ||
        (f.department && f.department.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredFaculty(filtered);
    } else {
      setFilteredFaculty(facultyList);
    }
  }, [searchQuery, facultyList]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Class":
        return "bg-red-100 text-red-700 border-red-200";
      case "Status Unknown":
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // --- 4. NEW FUNCTION to handle button click ---
  const handleCardButton = (member) => {
    // If the logged-in user is a student
    if (user.role === 'ROLE_STUDENT') {
      navigate(`/schedule?facultyId=${member.id}`);
    }
    // If the logged-in user is a faculty AND is viewing their *own* card
    else if (user.role === 'ROLE_FACULTY' && user.username === member.username) {
      navigate('/profile');
    }
    // Otherwise, do nothing (e.g., faculty viewing another faculty's card)
  };

  return (
    <div className="space-y-8">
      <Message message={message} />
      <div className="gradient-border p-8 rounded-3xl">
        <h1 className="text-4xl font-bold font-poppins mb-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent">
          Faculty Directory
        </h1>
        <p className="text-gray-600 text-lg">
          Find faculty members and check their status.
        </p>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name, username, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14  rounded-full border-none bg-white shadow-lg text-lg focus:ring-2 focus:ring-[#9B8CFF]/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="rounded-3xl animate-pulse overflow-hidden">
              {/* ... Skeleton content ... */}
            </Card>
          ))
        ) : filteredFaculty.length > 0 ? (
          filteredFaculty.map((member) => (
            <Card
              key={member.id}
              className="border-none shadow-xl hover-lift rounded-3xl overflow-hidden bg-white transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#C8B6FF]/20 to-[#A8C7FF]/20 rounded-full -mr-12 -mt-12 opacity-50" />

              <CardHeader className="text-center relative z-10 pt-8">
                <div className="relative mx-auto mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden border-2 border-white">
                    {member.profileImageUrl ? (
                      <img
                        src={`${BACKEND_BASE_URL}${member.profileImageUrl}`}
                        alt={member.username}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.outerHTML = `<span class="text-3xl font-bold">${getInitials(member.fullName || member.username)}</span>`; }}
                      />
                    ) : (
                      getInitials(member.fullName || member.username)
                    )}
                  </div>
                  <Circle
                    className={`absolute -bottom-1 -right-1 w-6 h-6 ${member.currentStatus === "Available" ? "fill-green-500 text-green-500" : (member.currentStatus === "In Class" ? "fill-red-500 text-red-500" : "fill-gray-400 text-gray-400")
                      }`}
                  />
                </div>

                <h3 className="text-xl font-bold font-poppins text-gray-800">{member.fullName || member.username}</h3>
                <p className="text-sm text-gray-600">{member.department || 'No Department'}</p>

                <Badge className={`mt-3 rounded-full border ${getStatusColor(member.currentStatus)}`}>
                  {member.currentStatus}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3 relative z-10 pb-8">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                  <span className="truncate">{member.subjects || 'No subjects listed'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                  <span className="font-semibold">{member.currentLocation || 'N/A'}</span>
                </div>

                {/* --- 5. CONDITIONAL BUTTON LOGIC --- */}
                <div className="w-full pt-4">
                {/* IF STUDENT, show 'Schedule Meeting' */}
                  {user.role === 'ROLE_STUDENT' && (
                    <Button 
                      className="w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 shadow-lg text-white bg-blue-900 hover:bg-blue-1000"
                      onClick={() => handleCardButton(member)}
                      disabled={member.currentStatus !== "Available"} // Disable if not available
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {member.currentStatus === "Available" ? "Schedule Meeting" : "Unavailable"}
                    </Button>
                  )}

                  {/* IF FACULTY and IT'S MY CARD, show 'Edit Profile' */}
                  {user.role === 'ROLE_FACULTY' && user.username === member.username && (
                    <Button
                      className="w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 shadow-lg text-white"
                      onClick={() => handleCardButton(member)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit My Profile
                    </Button>
                  )}

                  {/* IF FACULTY and IT'S ANOTHER FACULTY'S CARD, show nothing */}
                  {user.role === 'ROLE_FACULTY' && user.username !== member.username && (
                    <div className="h-10"></div> // Empty spacer to keep card height consistent
                  )}
                </div>
                {/* --- END CONDITIONAL BUTTON --- */}

              </CardContent>
            </Card>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 text-center py-16">
            <p className="text-gray-500 text-lg">No faculty members found.</p>
          </div>
        )}
      </div>
      {/* <Chatbot /> */}
    </div>
  );
}