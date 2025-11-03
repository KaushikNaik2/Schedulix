// src/pages/AllAnnouncementsPage.jsx - UPDATED
import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Loader2, Edit, Trash2 } from "lucide-react";
import Message from "../components/Message";
import { ConfirmModal } from "../components/ConfirmModal";
import { EditAnnouncementModal } from "../components/EditAnnouncementModal";

export default function AllAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: null, text: '' });

  // State for Modals
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [editModal, setEditModal] = useState({ isOpen: false, announcement: null });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: '' }), 5000);
  }, []);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading announcements:", error);
      showMessage('error', `Failed to load announcements: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  // Handlers for Update and Delete
  const handleUpdate = async (id, title, message) => {
    try {
      await apiService.updateAnnouncement(id, title, message);
      showMessage('success', 'Announcement updated successfully!');
      loadAnnouncements(); // Refresh the list
    } catch (error) {
      showMessage('error', `Update failed: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteAnnouncement(id);
      showMessage('success', 'Announcement deleted successfully!');
      loadAnnouncements(); // Refresh the list
    } catch (error) {
      showMessage('error', `Delete failed: ${error.message}`);
    }
    setDeleteModal({ isOpen: false, id: null }); // Close modal
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Message message={message} />

      <Card className="border-none shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-poppins">
            <Megaphone className="w-6 h-6 text-[#2563EB]" />
            All Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => {
                
                // --- NEW 1-HOUR CHECK LOGIC ---
                const now = new Date();
                const createdAt = new Date(announcement.createdAt);
                const ageInMs = now.getTime() - createdAt.getTime();
                const oneHourInMs = 60 * 60 * 1000;
                const isEditable = ageInMs < oneHourInMs;
                // --- END NEW LOGIC ---

                return (
                  <div key={announcement.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-800">{announcement.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">{announcement.message}</p>
                      </div>
                      
                      {/* --- UPDATED: Show buttons only if owner AND within 1 hour --- */}
                      {user?.username === announcement.facultyName && isEditable && (
                        <div className="flex gap-2 flex-shrink-0 ml-4">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full w-8 h-8"
                            onClick={() => setEditModal({ isOpen: true, announcement: announcement })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full w-8 h-8 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setDeleteModal({ isOpen: true, id: announcement.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Posted by {announcement.facultyName} on {new Date(announcement.createdAt).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No announcements posted yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Render the Modals (No change) */}
      <EditAnnouncementModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, announcement: null })}
        announcement={editModal.announcement}
        onSave={handleUpdate}
      />
      
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="Delete Announcement?"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}