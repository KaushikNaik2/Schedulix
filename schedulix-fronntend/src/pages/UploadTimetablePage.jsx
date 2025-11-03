// src/pages/UploadTimetablePage.jsx
import React, { useState, useCallback } from 'react';
import apiService from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, FileCheck2 } from "lucide-react";
import Message from "../components/Message"; // Make sure this component exists

export default function UploadTimetablePage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: null, text: '' });

    const showMessage = useCallback((type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: null, text: '' }), 5000);
    }, []);

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            // Check if file is an Excel file
            const file = event.target.files[0];
            if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.endsWith(".xlsx")) {
                setSelectedFile(file);
                showMessage('info', `Selected file: ${file.name}`);
            } else {
                showMessage('error', 'Invalid file type. Please upload an .xlsx file.');
                event.target.value = null; // Clear the input
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showMessage('error', 'Please select an Excel file first.');
            return;
        }
        setIsLoading(true);
        showMessage('info', 'Uploading timetable...');

        const formData = new FormData();
        formData.append('file', selectedFile); // Key must be 'file'

        try {
            const responseText = await apiService.uploadTimetable(formData);
            showMessage('success', responseText); // Show success message from backend
            setSelectedFile(null);
            // Clear the file input visually (requires a ref or more complex state)
            document.getElementById('timetableFile').value = null;
        } catch (error) {
            showMessage('error', `Upload failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold font-poppins text-gray-800">Upload Timetable</h1>
            <Message message={message} />

            <Card className="border-none shadow-xl rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-poppins">
                        <Upload className="w-6 h-6 text-[#7C3AED]" />
                        Upload Timetable File
                    </CardTitle>
                    <CardDescription>
                        Upload your weekly schedule as an .xlsx file.
                        Please use the grid format (Time Slots in Column A, Days in Row 1).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="timetableFile" className="text-base font-semibold">Excel File (.xlsx)</Label>
                        <Input
                            id="timetableFile"
                            type="file"
                            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xlsx"
                            onChange={handleFileChange}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {selectedFile && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <FileCheck2 size={16} />
                                <span>{selectedFile.name}</span>
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={handleUpload}
                        disabled={isLoading || !selectedFile}
                       className="w-full h-12 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white hover:opacity-90 text-lg font-semibold shadow-xl disabled:opacity-500"
                        >                  
                         {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                        {isLoading ? "Uploading..." : "Upload File"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}