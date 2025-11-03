// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import the hook

const ProtectedRoute = ({ children }) => {
    // Get the token and loading status from the AuthContext
    const { token, loading } = useAuth();

    // If still loading the initial auth state, don't render anything yet
    // (prevents flashing the login page briefly if already logged in)
    if (loading) {
        return <div>Loading authentication status...</div>; // Or return null or a loading spinner
    }

    // If loading is finished and there's no token, redirect to login
    if (!token) {
        // Redirect them to the /login page (or /auth if that's your route)
        return <Navigate to="/auth" replace />;
    }

    // If loading is finished and there IS a token, render the child component
    // If used as a wrapper route (<Route element={<ProtectedRoute><Layout/></ProtectedRoute>}>),
    // Outlet will render the matched child route.
    // If used directly (<ProtectedRoute><Dashboard/></ProtectedRoute>), children will be rendered.
    return children ? children : <Outlet />;
};

export default ProtectedRoute;