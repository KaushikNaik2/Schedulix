// src/pages/FacultyMeetingsPage.jsx - CORRECTED
import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Check, X, Loader2, Users, CheckCircle2 } from "lucide-react";
import Message from "../components/Message";
import { format } from 'date-fns';
import { ConfirmModal } from "../components/ConfirmModal"; // <-- ADD THIS LINE

// Helper to get status styles
const getStatusStyles = (status) => {
  switch (status) {
    case 'APPROVED':
      return { icon: <Check size={18} />, badge: "bg-green-100 text-green-800" };
    case 'DENIED':
      return { icon: <X size={18} />, badge: "bg-red-100 text-red-800" };
    case 'PENDING':
    default:
      return { icon: <Clock size={18} />, badge: "bg-yellow-100 text-yellow-800" };
  }
};

export default function FacultyMeetingsPage() {
  const { user } = useAuth();
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: null, text: '' });

  // --- FIX 1: Wrap showMessage in useCallback ---
  // This stops the infinite loop.
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: '' }), 5000);
  }, []); // Empty dependency array [] is crucial

  // Function to load ALL requests
  const loadAllRequests = useCallback(async () => {
    setLoading(true);
    try {
      // Call the API to get ALL requests
      const data = await apiService.getFacultyRequests('all'); 
      
      // --- FIX 2: Removed any buggy date filters ---
      // We will just display all requests returned from the API.
      setAllRequests(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Error loading all requests:", error);
      showMessage('error', `Failed to load requests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [showMessage]); // Add showMessage as a dependency

  useEffect(() => {
    if (user) {
      loadAllRequests();
    }
  }, [user, loadAllRequests]);

  // Action Handler (Approve/Deny)
  const handleAction = async (requestId, action) => {
    // This confirmation now uses the custom modal
    setModalState({
      isOpen: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Request?`,
      message: `Are you sure you want to ${action} this request?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      confirmVariant: action === 'deny' ? 'destructive' : 'default',
      onConfirm: () => onConfirmAction(requestId, action),
      isLoading: false
    });
  };
  
  // State for the modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    confirmVariant: 'default',
    onConfirm: () => {},
    isLoading: false
  });

  // Function that runs when "Confirm" is clicked on the modal
  const onConfirmAction = async (requestId, action) => {
    setModalState(prev => ({ ...prev, isLoading: true }));
    try {
      const responseText = await apiService.updateMeetingRequest(requestId, action);
      showMessage('success', responseText);
      loadAllRequests(); // Refresh the full list
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      showMessage('error', `Failed to ${action} request: ${error.message}`);
    } finally {
      setModalState({ isOpen: false, isLoading: false }); // Close modal
    }
  };


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Message message={message} />

      <Card className="border-none shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-poppins">
            <Users className="w-6 h-6 text-[#2563EB]" />
            Manage All Meeting Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
            </div>
          ) : allRequests.length > 0 ? (
            <div className="space-y-4">
              {allRequests.map((request) => {
                const { icon, badge } = getStatusStyles(request.status);
                return (
                  <div
                    key={request.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-gray-50 border"
                  >
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${badge} flex items-center justify-center`}>
                        {icon}
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-gray-800">{request.topic}</p>
                        <p className="text-sm text-gray-600">
                          With: <strong>{request.studentName}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="text-right w-full sm:w-auto">
                      <p className="font-medium text-gray-700">
                        {request.meetingDate ? format(new Date(request.meetingDate), "MMM d, yyyy") : 'No Date'}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {request.meetingTime ? request.meetingTime.substring(0, 5) : 'No Time'}
                      </p>
                      {request.status === 'PENDING' ? (
                        <div className="flex gap-2 mt-2 justify-end">
                          <Button size="sm" className="rounded-full bg-green-500 hover:bg-green-600" onClick={() => handleAction(request.id, 'approve')}>
                            <Check size={16} className="mr-1"/> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleAction(request.id, 'deny')}>
                            <X size={16} className="mr-1"/> Deny
                          </Button>
                        </div>
                      ) : (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge}`}>
                          {request.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No meeting requests found.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* This renders the confirmation modal */}
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
    </div>
  );
}