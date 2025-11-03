// src/App.jsx - CORRECTED
import React from 'react';
// Import BrowserRouter AS Router removed. Only Routes, Route, and Navigate are needed.
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// --- Import ALL Your Pages ---
import Layout from './Layout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import Availability from './pages/Availability';
import Schedule from './pages/Schedule';
import ProfilePage from './pages/ProfilePage';       // Faculty Profile
import StudentProfile from './pages/StudentProfile'; // Student Profile
import CreateAnnouncementPage from './pages/CreateAnnouncementPage';
import AllAnnouncementsPage from './pages/AllAnnouncementsPage';
import StudentMeetingsPage from './pages/StudentMeetingsPage';
import FacultyMeetingsPage from './pages/FacultyMeetingsPage';
import UploadTimetablePage from './pages/UploadTimetablePage';

// Import your main CSS
import './App.css';

// --- HELPER COMPONENTS (DEFINED FIRST) ---
// (All helper components like ProtectedRoute, PublicRoute, etc. stay the same)
const ProtectedRoute = ({ children }) => {
    const { token, loading } = useAuth();
    if (loading) return <div>Loading session...</div>;
    if (!token) return <Navigate to="/auth" replace />;
    return children;
};

const PublicRoute = ({ children }) => {
    const { token, loading } = useAuth();
    if (loading) return <div>Loading session...</div>;
    return !token ? children : <Navigate to="/" replace />;
};

const FacultyOnlyRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading || !user) return <div>Loading...</div>;
    return user.role === 'ROLE_FACULTY' ? children : <Navigate to="/" replace />;
};

const StudentOnlyRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading || !user) return <div>Loading...</div>;
    return user.role === 'ROLE_STUDENT' ? children : <Navigate to="/" replace />;
};

function DashboardDecider() {
    const { user, loading } = useAuth();
    if (loading || !user) return <div>Loading dashboard...</div>;
    if (user.role === 'ROLE_FACULTY') return <FacultyDashboard />;
    if (user.role === 'ROLE_STUDENT') return <Dashboard />;
    return <div>Unknown user role.</div>;
}

function ProfileDecider() {
    const { user, loading } = useAuth();
    if (loading || !user) return <div>Loading profile...</div>;
    if (user.role === 'ROLE_FACULTY') return <ProfilePage />;
    if (user.role === 'ROLE_STUDENT') return <StudentProfile />;
    return <Navigate to="/" replace />;
}

// --- MAIN APP COMPONENT ---
function App() {
    return (
        // <Router> <-- REMOVED THIS
        <Routes>
            {/* --- Public Route --- */}
            <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

            {/* --- Protected Routes (Inside Layout) --- */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>} >
                <Route path="/" element={<DashboardDecider />} />
                <Route path="/availability" element={<Availability />} />
                <Route path="/announcements" element={<AllAnnouncementsPage />} />
                <Route path="/profile" element={<ProfileDecider />} />

                {/* --- Student-Only Routes --- */}
                <Route path="/schedule" element={<StudentOnlyRoute><Schedule /></StudentOnlyRoute>} />
                <Route path="/student/meetings" element={<StudentOnlyRoute><StudentMeetingsPage /></StudentOnlyRoute>} />

                {/* --- Faculty-Only Routes --- */}
                <Route path="/announcements/new" element={<FacultyOnlyRoute><CreateAnnouncementPage /></FacultyOnlyRoute>} />
                <Route path="/faculty/meetings" element={<FacultyOnlyRoute><FacultyMeetingsPage/></FacultyOnlyRoute>} />
                <Route path="/faculty/timetable/upload" element={<FacultyOnlyRoute><UploadTimetablePage/></FacultyOnlyRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
        // </Router> <-- REMOVED THIS
    );
}

export default App;