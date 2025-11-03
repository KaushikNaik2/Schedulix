// src/pages/Schedule.jsx - CORRECTED
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Calendar as CalendarIcon, Clock, MessageSquare, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import Message from "../components/Message";
// import Chatbot from "../components/chatbot";

// Define backend base URL for images
const BACKEND_BASE_URL = 'http://localhost:8080';

export default function Schedule() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(""); // For buttons
  const [customTime, setCustomTime] = useState(""); // For custom input
  const [purpose, setPurpose] = useState(""); // Moved this up
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [message, setMessage] = useState({ type: null, text: '' });

  // Wrap showMessage in useCallback
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: '' }), 5000);
  }, []);

  // AM/PM time slots
  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
  ];

  // Fetch faculty list
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const facultyData = await apiService.getFacultyList();
      setFaculty(Array.isArray(facultyData) ? facultyData : []);

      const facultyId = searchParams.get('facultyId');
      if (facultyId && facultyData.some(f => f.id.toString() === facultyId)) {
        setSelectedFaculty(facultyId);
      }
    } catch (error) {
      console.error("Error loading faculty:", error);
      showMessage('error', `Failed to load faculty list: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, showMessage]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);


  // Helper for initials
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // --- THESE FUNCTIONS MUST BE DEFINED *OUTSIDE* handleSubmit ---
  const handleTimeSlotClick = (time) => {
    setSelectedTime(time); // Set button time
    setCustomTime("");     // Clear custom time
  };
  const handleCustomTimeChange = (e) => {
    setCustomTime(e.target.value); // Set custom time
    setSelectedTime("");         // Clear button time
  };
  // --- END OF FIX ---


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFaculty || !selectedDate || (!selectedTime && !customTime) || !purpose || !user) {
      showMessage('error', 'Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: null, text: '' });

    const facultyMember = faculty.find(f => f.id.toString() === selectedFaculty);
    if (!facultyMember) {
      showMessage('error', 'Selected faculty not found. Please refresh.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      let formattedTime = "";
      if (customTime) {
        formattedTime = customTime;
      } else if (selectedTime) {
        formattedTime = format(new Date(`1970-01-01 ${selectedTime}`), "HH:mm");
      }
      
      await apiService.sendMeetingRequest(
        facultyMember.username,
        purpose,
        formattedDate,
        formattedTime
      );

      setShowConfetti(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error("Error scheduling meeting:", error);
      showMessage('error', `Failed to schedule meeting: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Message message={message} />
      {/* Header */}
      <div className="gradient-border p-8 rounded-3xl">
        <h1 className="text-4xl font-bold font-poppins mb-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent">
          Schedule a Meeting
        </h1>
        <p className="text-gray-600 text-lg">
          Book an appointment with your preferred faculty member
        </p>
      </div>

      {/* Form */}
      <Card className="border-none shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-poppins">
            <CalendarIcon className="w-6 h-6 text-[#2563EB]" />
            Meeting Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Faculty Selection */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Select Faculty Member *</Label>
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty} disabled={isLoading}>
                <SelectTrigger className="h-12 rounded-2xl border-gray-200">
                  <SelectValue placeholder={isLoading ? "Loading faculty..." : "Choose a faculty member"} />
                </SelectTrigger>
                <SelectContent>
                  {faculty.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 overflow-hidden">
                          {member.profileImageUrl ? (
                            <img src={`${BACKEND_BASE_URL}${member.profileImageUrl}`} alt={member.username} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            getInitials(member.fullName || member.username)
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{member.fullName || member.username}</p>
                          <p className="text-xs text-gray-500">{member.department || 'No Department'}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Select Date *</Label>
              <div className="flex justify-center p-4 bg-gradient-to-br from-[#C8B6FF]/5 to-[#A8C7FF]/5 rounded-2xl">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0 || date.getDay() === 6}
                  className="rounded-2xl w-80"
                />
              </div>
            </div>


            {/* Time Selection (Buttons) */}
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Select Time Slot
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={selectedTime === time ? "default" : "outline"}
                    className={`rounded-full ${selectedTime === time
                        ? "bg-gradient-to-r from-[#9B8CFF] to-[#89BFFF] hover:opacity-90"
                        : "hover:bg-[#C8B6FF]/10"
                      }`}
                    onClick={() => handleTimeSlotClick(time)} // This will now work
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Custom Time Input */}
            <div className="space-y-2">
              <Label htmlFor="customTime" className="text-base font-semibold">
                Or Enter Custom Time *
              </Label>
              <Input
                id="customTime"
                type="time" 
                value={customTime}
                onChange={handleCustomTimeChange} // This will now work
                className="h-12 rounded-2xl border-gray-200"
                min="08:10"
                max="17:00"
              />
              <p className="text-xs text-gray-500">Note: Please select a time between 08:10 AM and 05:00 PM.</p>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Purpose of Meeting *
              </Label>
              <Textarea
                placeholder="Briefly describe what you'd like to discuss..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="min-h-32 rounded-2xl resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!selectedFaculty || !selectedDate || (!selectedTime && !customTime) || !purpose || isSubmitting}
              className="w-full h-14 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 text-white text-lg font-semibold shadow-xl disabled:opacity-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Confirm Meeting
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Confetti (No change) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl animate-bounce">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-2xl font-bold text-center">Meeting Scheduled! 🎉</p>
            <p className="text-gray-600 text-center mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      {/* <Chatbot /> */}
    </div>
  );
}