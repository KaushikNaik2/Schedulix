import React, { useState } from 'react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // To potentially update user context after upload
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Message from './Message'; // Import Message component

function ProfilePictureUpload() {
    const { user, processToken, token } = useAuth(); // Get user and maybe a function to refresh context
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: null, text: '' });

     const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: null, text: '' }), 5000);
    };

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showMessage('error', 'Please select an image file first.');
            return;
        }
        setIsLoading(true);
        setMessage({ type: null, text: '' });

        const formData = new FormData();
        formData.append('profileImage', selectedFile); // Key must match @RequestParam in backend

        try {
            // Call the API service function
            const updatedUserDTO = await apiService.uploadProfilePicture(formData);
            showMessage('success', 'Profile picture updated successfully!');
            setSelectedFile(null); // Clear file input visually (may need ref)

            // OPTIONAL: Update user context immediately if backend returns updated user DTO
            // This requires processToken or a setUser function in AuthContext
            // Example (if processToken works by re-decoding):
            // if(token) processToken(token);
            // Or ideally, update user state directly if context provides a setter:
             // authContext.updateUser({ ...user, profileImageUrl: updatedUserDTO.profileImageUrl });


            // Force a refresh to see changes (simpler method)
            // window.location.reload();


        } catch (error) {
            console.error("Upload error:", error);
            showMessage('error', `Upload failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card form-container max-w-sm"> {/* Example styling */}
            <h2>Upload Profile Picture</h2>
            <Message message={message} />
            <div className="space-y-4">
                <Input
                    type="file"
                    accept="image/png, image/jpeg, image/gif" // Accept common image types
                    onChange={handleFileChange}
                    className="input-field file-input"
                />
                 {selectedFile && <p className="text-sm text-gray-700">Selected: {selectedFile.name}</p>}
                <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isLoading}
                    className="button button-primary w-full"
                >
                    {isLoading ? 'Uploading...' : 'Upload Image'}
                </Button>
            </div>
        </div>
    );
}

export default ProfilePictureUpload;