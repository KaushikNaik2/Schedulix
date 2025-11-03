// src/pages/ProfilePage.jsx - (For FACULTY)
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../contexts/AuthContext"; 
import apiService from "../services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator"; 
import { User, Image as ImageIcon, Save, Loader2, Upload, Trash2 } from "lucide-react";
import Message from "../components/Message";
import { ConfirmModal } from "../components/ConfirmModal";

export default function ProfilePage() {
    // Get user and setUser function from context
    const { user, setUser } = useAuth(); 
    
    // State for the forms
    const [formData, setFormData] = useState({
        fullName: '',
        department: '',
        subjects: '',
        officeLocation: '' // <-- YEH ADD KAREIN
    });
    const [selectedFile, setSelectedFile] = useState(null);
    
    // State for loading indicators
    const [isLoading, setIsLoading] = useState(true); // For initial data load
    const [isUpdating, setIsUpdating] = useState(false); // For text update
    const [isUploading, setIsUploading] = useState(false); // For image upload
    const [message, setMessage] = useState({ type: null, text: '' }); // For messages

    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        isLoading: false
    });

    // Wrap showMessage in useCallback
    const showMessage = useCallback((type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: null, text: '' }), 5000);
    }, []);

    // 1. Fetch current user profile data on load
    const loadUserProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            // Use the user from context first, which should be the full DTO
            if (user) {
                setFormData({
                    fullName: profileData.fullName || '',
                    department: profileData.department || '',
                    subjects: profileData.subjects || '',
                    officeLocation: profileData.officeLocation || '' // <-- YEH ADD KAREIN
                });
            } else {
                 // Fallback if context user isn't populated yet
                const profileData = await apiService.getCurrentUser();
                setFormData({
                    fullName: profileData.fullName || '',
                    department: profileData.department || '',
                    subjects: profileData.subjects || ''
                });
            }
        } catch (error) {
            showMessage('error', `Failed to load profile: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [user, showMessage]); // Run when user object from context changes

    useEffect(() => {
        loadUserProfile();
    }, [loadUserProfile]);

    // 2. Handle text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Handle file input change
    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    // 4. Handle text profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        showMessage('info', 'Updating profile...');
        try {
            await apiService.updateProfileInfo(formData); // Yeh ab officeLocation bhi bhejega
            // Send ALL text form data
            const updatedUser = await apiService.updateProfileInfo({
                fullName: formData.fullName,
                department: formData.department,
                subjects: formData.subjects
            });
            // Instantly update the global user state in AuthContext
            setUser(updatedUser); 
            showMessage('success', 'Profile updated successfully!');
        } catch (error) {
            showMessage('error', `Failed to update profile: ${error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    // 5. Handle profile picture upload
    const handleUpload = async () => {
        if (!selectedFile) {
            showMessage('error', 'Please select an image file first.');
            return;
        }
        setIsUploading(true);
        showMessage('info', 'Uploading picture...');

        const formData = new FormData();
        formData.append('profileImage', selectedFile);

        try {
            const updatedUser = await apiService.uploadProfilePicture(formData);
            // Instantly update the global user state in AuthContext
            setUser(updatedUser);
            showMessage('success', 'Profile picture updated!');
            setSelectedFile(null); 
            document.getElementById('profileImage').value = null; // Clear file input
        } catch (error) {
            showMessage('error', `Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

// --- 3. "REMOVE" LOGIC KO UPDATE KAREIN ---
    // Yeh function modal ko kholta hai
    const handleRemovePicture = () => {
        if (!user.profileImageUrl) return;
        
        setModalState({
            isOpen: true,
            title: 'Remove Profile Picture?',
            message: 'Are you sure you want to remove your profile picture?',
            confirmText: 'Remove',
            confirmVariant: 'destructive',
            onConfirm: () => onConfirmRemove(), // Confirm par yeh function call hoga
            isLoading: false
        });
    };

    // Yeh function API call karta hai jab "Confirm" click hota hai
    const onConfirmRemove = async () => {
        setModalState(prev => ({ ...prev, isLoading: true })); // Spinner chalu
        showMessage('info', 'Removing picture...');
        try {
            const updatedUser = await apiService.removeProfilePicture();
            setUser(updatedUser); // Context ko update karein
            showMessage('success', 'Profile picture removed.');
        } catch (error) {
            showMessage('error', `Failed to remove picture: ${error.message}`);
        } finally {
            setModalState({ isOpen: false, isLoading: false }); // Modal band karein
        }
    };
    // --- END REMOVE LOGIC ---


    if (isLoading) {
        return <div className="text-center p-8">Loading profile...</div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold font-poppins text-gray-800">My Profile</h1>
            <Message message={message} />

            {/* Combined Card for Profile Details and Picture */}
            <Card className="border-none shadow-xl rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-poppins">
                        <User className="w-6 h-6 text-[#2563EB]" />
                        Edit Profile
                    </CardTitle>
                    <CardDescription>Update your public information and profile picture.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Form 1: Update Profile Details */}
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-base font-semibold">Full Name</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="e.g., Dr. Sonal Balpande"
                                className="h-12 rounded-2xl border-gray-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department" className="text-base font-semibold">Department</Label>
                            <Input
                                id="department"
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                placeholder="e.g., Computer Science"
                                className="h-12 rounded-2xl border-gray-200"
                            />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="officeLocation" className="text-base font-semibold">Office / Cabin Location</Label>
                        <Input
                            id="officeLocation"
                            name="officeLocation"
                            value={formData.officeLocation}
                            onChange={handleInputChange}
                            placeholder="e.g., Cabin (304D), 3nd Floor"
                            className="h-12 rounded-2xl border-gray-200"
                        />
                    </div>
                        <div className="space-y-2">
                            <Label htmlFor="subjects" className="text-base font-semibold">Subjects</Label>
                            <Input
                                id="subjects"
                                name="subjects"
                                value={formData.subjects}
                                onChange={handleInputChange}
                                placeholder="e.g., AT, ADSA"
                                className="h-12 rounded-2xl border-gray-200"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="w-full h-12 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 text-lg font-semibold shadow-xl disabled:opacity-50"
                        >
                            {isUpdating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>

                    {/* --- Divider --- */}
                    <Separator className="my-8" /> 

                    {/* Section 2: Update Profile Picture */}
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="profileImage" className="text-base font-semibold flex items-center gap-2">
                                 <ImageIcon className="w-5 h-5 text-[#2563EB]" />
                                 Update Profile Picture
                             </Label>
                            <Input
                                id="profileImage"
                                type="file"
                                accept="image/png, image/jpeg, image/gif"
                                onChange={handleFileChange}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                             {selectedFile && <p className="text-sm text-gray-500">Selected: {selectedFile.name}</p>}
                        </div>
                        <Button
                            onClick={handleUpload}
                            disabled={isUploading || !selectedFile}
                            className="w-full h-12 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 text-lg font-semibold shadow-xl disabled:opacity-500"
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                            {isUploading ? "Uploading..." : "Upload Picture"}
                        </Button>
                   {/* --- 4. "REMOVE" BUTTON (onClick update kiya gaya) --- */}
                        {user.profileImageUrl && (
                            <Button
                                onClick={handleRemovePicture}
                                disabled={isUploading}
                                variant="outline"
                                className="w-full h-12 rounded-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                            >
                                {isUploading && modalState.isOpen ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Trash2 className="w-5 h-5 mr-2" />}
                                Remove Picture
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* --- 5. MODAL KO RENDER KAREIN --- */}
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