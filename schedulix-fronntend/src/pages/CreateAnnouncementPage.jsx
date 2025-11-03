// src/pages/CreateAnnouncementPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { Megaphone, Loader2 } from "lucide-react";
import Message from "../components/Message";

export default function CreateAnnouncementPage() {
    const [formData, setFormData] = useState({ title: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: null, text: '' });
    const navigate = useNavigate();

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: null, text: '' }), 5000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        showMessage('info', 'Posting announcement...');

        try {
            await apiService.createAnnouncement(formData.title, formData.message);
            showMessage('success', 'Announcement posted successfully! Redirecting...');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/'); 
            }, 2000);

        } catch (error) {
            showMessage('error', `Failed to post: ${error.message}`);
            setIsLoading(false);
        }
        // Don't set loading false on success, as we are redirecting
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Message message={message} />
            <Card className="border-none shadow-xl rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-poppins">
                        <Megaphone className="w-6 h-6 text-[#2563EB]" />
                        Post a New Announcement
                    </CardTitle>
                    <CardDescription>This will be visible to all logged-in users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-base font-semibold">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Holiday Declared"
                                className="h-12 rounded-2xl border-gray-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-base font-semibold">Message</Label>
                            <Textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="e.g., The college will be closed tomorrow..."
                                className="min-h-32 rounded-2xl resize-y"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 text-lg font-semibold shadow-xl disabled:opacity-500"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Post Now"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}