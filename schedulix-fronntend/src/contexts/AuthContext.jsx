// src/contexts/AuthContext.jsx - MERGED
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiService, { setToken as setApiToken } from '../services/api'; // Your existing API service

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- Notification State (from your file) ---
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // --- Notification Fetcher (from your file) ---
    const fetchNotifications = useCallback(async () => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) return;

        try {
            const data = await apiService.getNotifications();
            if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.length);
            }
        } catch (error) {
            console.error("Polling for notifications failed:", error);
        }
    }, []);

    // This function processes the token AND fetches the user profile (from your file)
    const processToken = useCallback(async (currentToken) => {
        if (!currentToken) {
            setUser(null);
            setApiToken(null);
            setLoading(false);
            setNotifications([]);
            setUnreadCount(0);
            return;
        }
        try {
            const decoded = jwtDecode(currentToken);
            const currentTime = Date.now() / 1000;

            if (decoded.exp > currentTime) {
                setApiToken(currentToken);

                try {
                    const fullUserData = await apiService.getCurrentUser();
                    setUser(fullUserData);
                    await fetchNotifications();
                } catch (apiError) {
                    console.error("Failed to fetch user data:", apiError);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setApiToken(null);
                    setNotifications([]);
                    setUnreadCount(0);
                }
            } else {
                console.warn("Token expired.");
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
                setApiToken(null);
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Failed to decode token:", error);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setApiToken(null);
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    }, [fetchNotifications]);

    // --- Notification Polling Effect (from your file) ---
    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log("Polling for notifications...");
            fetchNotifications();
        }, 30000); // 30 seconds
        return () => clearInterval(intervalId);
    }, [fetchNotifications]);

    // This effect still runs when the token itself changes (login/logout)
    useEffect(() => {
        setLoading(true);
        processToken(token);
    }, [token, processToken]);

    // --- Auth Functions ---

    const login = async (username, password) => {
        try {
            const response = await apiService.login(username, password);
            const newToken = response.token;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            return response;
        } catch (error) {
            console.error("Login failed in context:", error);
            throw error;
        }
    };

    // --- **FIX 1: UPDATED REGISTER FUNCTION** ---
    // Your old function only sent username, password, role.
    // This one sends the full registration object.
    const register = async (registerData) => {
        try {
            const response = await apiService.register(registerData); // registerData is the full object
            return response;
        } catch (error) {
            console.error("Registration failed in context:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        apiService.setToken(null);
        console.log("User logged out.");
    };

    // --- **FIX 2: NEW FORGOT PASSWORD FUNCTIONS** ---
    const forgotStart = async (username) => {
        try {
            const response = await apiService.forgotStart(username);
            return response; // { "securityQuestionIndex": 1 }
        } catch (error) {
            console.error("Forgot Start failed:", error);
            throw error;
        }
    };

    const forgotVerify = async (username, answer) => {
        try {
            const responseText = await apiService.forgotVerify(username, answer);
            return responseText; // "Verification successful."
        } catch (error) {
            console.error("Forgot Verify failed:", error);
            throw error;
        }
    };

    const forgotUpdate = async (username, newPassword) => {
        try {
            const responseText = await apiService.forgotUpdate(username, newPassword);
            return responseText; // "Password updated successfully."
        } catch (error) {
            console.error("Forgot Update failed:", error);
            throw error;
        }
    };


    // --- Notification markAsRead (from your file) ---
    const markAsRead = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));

        apiService.markNotificationAsRead(notificationId).catch(err => {
            console.error("Failed to mark as read:", err);
            fetchNotifications();
        });
    };

    // --- **FIX 3: EXPORT NEW VALUES** ---
    const value = {
        token,
        user,
        setUser,
        loading,
        login,
        logout,
        register, // <-- Updated function
        notifications,
        unreadCount,
        markAsRead,
        forgotStart,    // <-- New function
        forgotVerify,   // <-- New function
        forgotUpdate    // <-- New function
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook to easily consume the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

