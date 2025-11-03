// src/Layout.jsx - UPDATED for Profile Image AND Theme Toggle
import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import {
    Search, Bell, Calendar, Users, Home,  LogOut, User as UserIcon,
    Clock, MessageSquareText, Upload // <-- 2. IMPORT SUN/MOON
} from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import SchedulixLogo from './assets/logo.jpeg';
import { Input } from "@/components/ui/input.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu.jsx";

// Define backend base URL for images
const BACKEND_BASE_URL = 'http://localhost:8080';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, notifications, unreadCount, markAsRead } = useAuth();
    const getInitials = (username) => {
        if (!username) return "?";
        return username.charAt(0).toUpperCase();
    };

    const handleLogout = () => {
        logout();
        navigate('/auth'); // Redirect to login page
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                Loading User Data...
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-gradient-to-br from-[#E3DFFD] via-[#D8E5FF] to-[#EEF4FF] text-foreground">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
                            <img
                                src={SchedulixLogo}
                                alt="Schedulix Logo"
                                className="h-10 w-10 object-contain rounded-full group-hover:scale-105 transition-transform"
                            />
                            <span className="text-2xl font-bold font-poppins text-indigo-600 dark:text-indigo-400 hidden sm:inline-block">
                Schedulix
              </span>
                        </Link>

                        {/* Center Navigation */}
                        <div className="hidden md:flex flex-1 items-center justify-center gap-8">
                            <Link to="/">
                                <Button variant="ghost" className={`rounded-full ${location.pathname === "/" ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}>
                                    <Home className="w-4 h-4 mr-2" /> Dashboard
                                </Button>
                            </Link>
                            <Link to="/availability">
                                <Button variant="ghost" className={`rounded-full ${location.pathname === "/availability" ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}>
                                    <Users className="w-4 h-4 mr-2" /> Faculty List
                                </Button>
                            </Link>

                            {user.role === 'ROLE_STUDENT' && (
                                <>
                                    <Link to="/schedule">
                                        <Button variant="ghost" className={`rounded-full ${location.pathname === "/schedule" ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}>
                                            <Calendar className="w-4 h-4 mr-2" /> Schedule Meeting
                                        </Button>
                                    </Link>
                                    <Link to="/student/meetings">
                                        <Button variant="ghost" className={`rounded-full ${location.pathname === "/student/meetings" ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}>
                                            <Clock className="w-4 h-4 mr-2" /> My Requests
                                        </Button>
                                    </Link>
                                </>
                            )}
                            {user.role === 'ROLE_FACULTY' && (
                                <>
                                    <Link to="/faculty/meetings">
                                        <Button variant="ghost" className={`rounded-full ${location.pathname === "/faculty/meetings" ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}>
                                            <Users className="w-4 h-4 mr-2" /> Manage Requests
                                        </Button>
                                    </Link>
                                    <Link to="/announcements/new">
                                        <Button variant="ghost" className={`rounded-full ${location.pathname === "/announcements/new" ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}>
                                            <MessageSquareText className="w-4 h-4 mr-2" /> Post Announcement
                                        </Button>
                                    </Link>
                                    <Link to="/faculty/timetable/upload">
                                        <Button variant="ghost" className={`rounded-full ${location.pathname === "/faculty/timetable/upload" ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}>
                                            <Upload className="w-4 h-4 mr-2" /> Upload Timetable
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">

                            {/* --- 4. ADD THE THEME TOGGLE BUTTON --- */}

                            {/* Notification Bell (Your existing code) */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-accent/50">
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                                                {unreadCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 rounded-2xl">
                                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <DropdownMenuItem
                                                key={notif.id}
                                                className="flex items-start gap-3 p-3 cursor-pointer"
                                                onClick={() => markAsRead(notif.id)}
                                            >
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                                                <div className="flex-grow">
                                                    <p className="text-sm leading-snug">{notif.message}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {format(new Date(notif.createdAt), "MMM d, h:mm a")}
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center p-4">No new notifications.</p>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Profile/Dropdown (Your existing code) */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="rounded-full p-0 w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-white font-semibold overflow-hidden">
                                        {user.profileImageUrl ? (
                                            <img
                                                src={`${BACKEND_BASE_URL}${user.profileImageUrl}`}
                                                alt={user.username}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.outerHTML = `<span class="text-xl font-bold">${getInitials(user.username)}</span>`; }}
                                            />
                                        ) : (
                                            getInitials(user.username)
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email || 'No email'}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => navigate('/profile')}
                                        className="cursor-pointer flex items-center gap-2"
                                    >
                                        <UserIcon className="w-4 h-4" />
                                        My Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 flex items-center gap-2">
                                        <LogOut className="w-4 h-4" /> Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Outlet />
            </main>
        </div>
    );
}