// src/pages/FacultyDashboard.jsx - UPDATED FOR API + "VIEW ALL" LINK
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate (ONCE)
import { useAuth } from "../contexts/AuthContext"; // Import useAuth
import apiService from "../services/api"; // Import apiService
import { Calendar, Users, Clock, CheckCircle2, ArrowRight, Megaphone, Upload, Check, X, MessageSquareText, Loader2 } from "lucide-react"; // Added Check, X, MessageSquareText, Loader2
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns"; // Import format for date
import Message from "../components/Message"; // Import Message
import { ConfirmModal } from "../components/ConfirmModal"; // Import ConfirmModal

// Define backend base URL for images
const BACKEND_BASE_URL = 'http://localhost:8080';

export default function FacultyDashboard() {
  const { user } = useAuth(); // Get logged-in user from context
  const navigate = useNavigate(); // Hook to navigate programmatically

  // State for data
  const [pendingRequests, setPendingRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // State for loading
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [message, setMessage] = useState({ type: null, text: '' }); // For errors

  // State for modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    confirmVariant: 'default',
    onConfirm: () => { },
    isLoading: false
  });

  // --- Utility Functions ---
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: '' }), 5000);
  }, []); // <-- Added useCallback

  const loadPendingRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      // Call the API to get only pending requests
      const requests = await apiService.getFacultyRequests('pending');
      setPendingRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      console.error("Error loading pending requests:", error);
      showMessage('error', `Failed to load requests: ${error.message}`);
    } finally {
      setLoadingRequests(false);
    }
  }, [showMessage]); // <-- Added showMessage dependency

  const loadAnnouncements = useCallback(async () => {
    setLoadingAnnouncements(true);
    try {
      const data = await apiService.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading announcements:", error);
      showMessage('error', `Failed to load announcements: ${error.message}`);
    } finally {
      setLoadingAnnouncements(false);
    }
  }, [showMessage]); // <-- Added showMessage dependency

  useEffect(() => {
    if (user) {
      loadPendingRequests();
      loadAnnouncements();
    }
  }, [user, loadPendingRequests, loadAnnouncements]); // Run when user or functions are available

  // --- Action Handlers ---
  const onConfirmAction = async (requestId, action) => {
    setModalState(prev => ({ ...prev, isLoading: true }));
    try {
      const responseText = await apiService.updateMeetingRequest(requestId, action);
      showMessage('success', responseText); // Show success message from backend
      loadPendingRequests(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      showMessage('error', `Failed to ${action} request: ${error.message}`);
    } finally {
      setModalState({ isOpen: false, isLoading: false }); // Close modal
    }
  };

  const handleAction = (requestId, action, studentName) => {
    const isApprove = action === 'approve';
    setModalState({
      isOpen: true,
      title: isApprove ? 'Approve Request?' : 'Deny Request?',
      message: `Are you sure you want to ${action} the request from ${studentName}?`,
      confirmText: isApprove ? 'Approve' : 'Deny',
      confirmVariant: isApprove ? 'default' : 'destructive',
      onConfirm: () => onConfirmAction(requestId, action),
      isLoading: false
    });
  };

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


  return (
    <div className="space-y-8">
      <Message message={message} /> {/* Display error/success messages */}

      {/* Greeting Banner */}
      <div className="gradient-border p-8 hover-lift rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-poppins mb-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent">
              {getGreeting()}, {user?.fullName || user?.username || 'Professor'}!
            </h1>
            <p className="text-gray-600 text-lg">
              Faculty Dashboard - Manage your schedule and announcements
            </p>
          </div>
          {/* Profile Image Display */}
          {user?.profileImageUrl && (
            <div className="hidden lg:block w-32 h-32 rounded-full shadow-lg overflow-hidden flex-shrink-0">
              <img
                src={`${BACKEND_BASE_URL}${user.profileImageUrl}`}
                alt={`${user.username} Profile`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.outerHTML = '<div class="w-full h-full bg-gray-300 flex items-center justify-center text-4xl text-white">' + getInitials(user.username) + '</div>'; }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/faculty/meetings" className="group">
          <Card className="border-none shadow-xl hover-lift bg-gradient-to-br from-[#2563EB]/10 to-white rounded-3xl overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8B6FF]/20 rounded-full -mr-16 -mt-16" />
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-poppins">Manage Requests</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-gray-600 mb-4">
                Review and approve/deny student meeting requests
              </p>
              <Button className="w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 shadow-lg text-white">
                View Requests <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        <Link to="/announcements/new" className="group">
          <Card className="border-none shadow-xl hover-lift bg-gradient-to-br from-[#2563EB]/10 to-white rounded-3xl overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8B6FF]/20 rounded-full -mr-16 -mt-16" />
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Megaphone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-poppins">Post Announcement</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-gray-600 mb-4">
                Share important updates with <br></br>Students/Faculty
              </p>
              <Button className="w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 shadow-lg text-white">
                Create Post<ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        <Link to="/faculty/timetable/upload" className="group">
          <Card className="border-none shadow-xl hover-lift bg-gradient-to-br from-[#2563EB]/10 to-white rounded-3xl overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8B6FF]/20 rounded-full -mr-16 -mt-16" />
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-poppins">Upload Timetable</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-gray-600 mb-4">
                Upload Excel timetable for availability/location tracking
              </p>
              <Button className="w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 shadow-lg text-white">
                Upload File <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* --- ANNOUNCEMENTS SECTION (NOW INCLUDES "VIEW ALL" LINK) --- */}
      <Card className="border-none shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-poppins">
            <MessageSquareText className="w-6 h-6 text-[#2563EB]" /> {/* Use appropriate icon */}
            Latest Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAnnouncements ? (
            <p>Loading announcements...</p>
          ) : announcements.length > 0 ? (
            <div className="space-y-4">
              {/* Show first 3 */}
              {announcements.slice(0, 3).map((announcement) => (
                <div key={announcement.id} className="p-4 rounded-2xl bg-gray-50 border">
                  <h4 className="font-semibold text-lg">{announcement.title}</h4>
                  <p className="text-sm text-gray-600 mb-1">{announcement.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Posted by {announcement.facultyName} on {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}

              {/* --- "VIEW ALL" LINK STYLED AS A BUTTON --- */}
              {announcements.length > 3 && ( // Only show if there are more than 3
                <div className="text-center mt-4 pt-4 border-t">
                  <Link to="/announcements">
                    <Button className="w-full max-w-xs mx-auto rounded-full bg-gradient-to-r  from-[#7C3AED] to-[#2563EB] hover:opacity-90 shadow-lg text-white font-semibold">
                      View All Announcements &rarr;
                    </Button>
                  </Link>
                </div>
              )}
              {/* --- END OF ADDITION --- */}

            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No announcements posted yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* --- END ANNOUNCEMENTS SECTION --- */}


      {/* Pending Meeting Requests */}
      <Card className="border-none shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl font-poppins">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#2563EB]" />
              Pending Meeting Requests
            </div>
            <Link to="/faculty/meetings">
              <Button className="w-full rounded-full bg-gradient-to-r  from-[#7C3AED] to-[#2563EB] hover:opacity-90 shadow-lg text-white">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRequests ? (
            <p>Loading requests...</p>
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#C8B6FF]/5 to-[#A8C7FF]/5 hover:from-[#C8B6FF]/10 hover:to-[#A8C7FF]/10 transition-all border"
                >
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C8B6FF] to-[#A8C7FF] flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                      {request.studentProfileImageUrl ? (
                        <img
                          src={`${BACKEND_BASE_URL}${request.studentProfileImageUrl}`}
                          alt={request.studentName}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.outerHTML = `<span class="text-xl font-bold">${getInitials(request.studentName)}</span>`; }}
                        />
                      ) : (
                        getInitials(request.studentName)
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{request.studentName}</p>
                      <p className="text-sm text-gray-600">{request.topic}</p>
                    </div>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <p className="font-medium text-[#9B8CFF]">
                      {request.meetingDate ? format(new Date(request.meetingDate), "MMM d, yyyy") : 'No Date'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.meetingTime ? request.meetingTime.substring(0, 5) : 'No Time'}
                    </p>
                    <div className="flex gap-2 mt-2 justify-end">
                      <Button
                        size="sm"
                        className="rounded-full bg-green-500 hover:bg-green-600"
                        onClick={() => handleAction(request.id, 'approve', request.studentName)}
                      >
                        <Check size={16} className="mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => handleAction(request.id, 'deny', request.studentName)}
                      >
                        <X size={16} className="mr-1" /> Deny
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No pending requests</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Render the Confirmation Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, isLoading: false })}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        confirmVariant={modalState.confirmVariant}
        isLoading={modalState.isLoading}
      />

      {/* <Chatbot /> */}
    </div>
  );
}