// src/pages/StudentMeetingsPage.jsx - UPDATED with Delete
import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Check, X, Loader2, Users, CheckCircle2, Trash2 } from "lucide-react"; // <-- 1. Import Trash2
import Message from "../components/Message";
import { ConfirmModal } from "../components/ConfirmModal"; // <-- 2. Import ConfirmModal
import { format } from 'date-fns';

// Helper to get status styles
const getStatusStyles = (status) => {
  // ... (no change here)
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

export default function StudentMeetingsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: null, text: '' });
  
  // --- 3. ADD STATE FOR MODAL ---
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    confirmVariant: 'default',
    onConfirm: () => {},
    isLoading: false
  });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
     setTimeout(() => setMessage({ type: null, text: '' }), 5000);
  }, []);

  // Function to load all of the student's requests
  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getMyStudentRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading meeting requests:", error);
      showMessage('error', `Failed to load requests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [showMessage]); 

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user, loadRequests]);

  // --- 4. ADD DELETE HANDLER FUNCTIONS ---
  
  // This runs when user clicks "Confirm" on the modal
  const onConfirmDelete = async (requestId) => {
    setModalState(prev => ({ ...prev, isLoading: true }));
    try {
        const responseText = await apiService.deleteMeetingRequest(requestId);
        showMessage('success', responseText);
        loadRequests(); // Refresh the list
    } catch (error) {
        console.error("Error deleting request:", error);
        showMessage('error', `Failed to delete request: ${error.message}`);
    } finally {
        setModalState({ isOpen: false, isLoading: false }); // Close modal
    }
  };

  // This runs when user clicks the red "Delete" button
  const handleDeleteClick = (request) => {
    setModalState({
      isOpen: true,
      title: 'Delete Meeting Request?',
      message: `Are you sure you want to delete your request for "${request.topic}" with ${request.facultyName}? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmVariant: 'destructive',
      onConfirm: () => onConfirmDelete(request.id),
      isLoading: false
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Message message={message} />

      <Card className="border-none shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-poppins">
            <Clock className="w-6 h-6 text-[#7C3AED]" />
            My Meeting Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-[#9B8CFF]" />
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => {
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
                          With: <strong>{request.facultyName}</strong>
                        </p>
                      </div>
                    </div>
                    
                    {/* Right side with date, time, and button */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="text-right flex-grow sm:flex-grow-0">
                            <p className="font-medium text-gray-700">
                                {request.meetingDate ? format(new Date(request.meetingDate), "MMM d, yyyy") : 'No Date'}
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                                {request.meetingTime ? request.meetingTime.substring(0, 5) : 'No Time'}
                            </p>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge}`}>
                                {request.status}
                            </span>
                        </div>
                        
                        {/* --- 5. ADD DELETE BUTTON --- */}
                        {/* Only show delete button if request is PENDING */}
                        {request.status === 'PENDING' && (
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="rounded-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                                onClick={() => handleDeleteClick(request)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                        {/* Add an empty box for alignment if not pending */}
                        {request.status !== 'PENDING' && <div className="w-9 h-9"></div>} 
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">You haven't submitted any requests yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* --- 6. RENDER THE MODAL --- */}
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