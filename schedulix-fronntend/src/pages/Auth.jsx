// src/pages/Auth.jsx - UPDATED FOR API & CONTEXT
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../contexts/AuthContext"; // Import useAuth
// ... other imports (Card, Button, Input, Label, Select, icons) ...
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, UserPlus, Eye, EyeOff, UserRound, KeyRound, UserCheck } from "lucide-react";
import Message from "../components/Message"; // Import Message component

// Import the specific CSS for this page
import './AuthPage.css'; // Assuming you named the CSS file AuthPage.css

export default function AuthPage() { // Renamed component for clarity
  const [isLogin, setIsLogin] = useState(true); // Start with Login view
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth(); // Get login/register functions from context
  const navigate = useNavigate(); // Hook for navigation

  // Separate state for login and register forms
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "", role: "STUDENT" }); // Default role

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: '' }); // For success/error messages

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: '' }), 5000); // Auto-clear
  };

  // --- Input Handlers ---
  const handleLoginChange = (e) => {
    setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
   const handleRegisterChange = (e) => {
     setRegisterData(prev => ({ ...prev, [e.target.name]: e.target.value }));
   };
   // Special handler for Shadcn Select component
   const handleRoleChange = (value) => {
       setRegisterData(prev => ({ ...prev, role: value }));
   };


  // --- Submit Handlers ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: null, text: '' });
    try {
      // Call login function from AuthContext
      await login(loginData.username, loginData.password);
      // AuthContext handles setting token/user state
      showMessage('success', 'Login successful! Redirecting...');
      navigate('/'); // Redirect to dashboard on success
    } catch (error) {
      console.error("Login error:", error);
      showMessage('error', error.message || 'Login failed. Check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
     if (!registerData.role) {
         showMessage('error', 'Please select a role.');
         return;
     }
    setIsLoading(true);
    setMessage({ type: null, text: '' });
    try {
      // Call register function from AuthContext
      const responseText = await register(registerData.username, registerData.password, registerData.role);
      showMessage('success', `${responseText} Please log in.`);
      setIsLogin(true); // Switch to login view after successful registration
      // Clear register form (optional)
       setRegisterData({ username: "", password: "", role: "STUDENT" });
    } catch (error) {
      console.error("Register error:", error);
      showMessage('error', error.message || 'Registration failed. Username might be taken.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Use background on body or a wrapper div in App.jsx, not needed here usually
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
           <h1 className="text-4xl font-bold font-poppins mb-2 bg-gradient-to-r from-[#9B8CFF] to-[#89BFFF] bg-clip-text text-transparent">
             Schedulix
           </h1>
           {/* Message component to display errors/success */}
           <Message message={message} />
        </div>

        {/* Auth Card */}
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden"> {/* Added overflow */}
          <div className={`relative transition-all duration-500 ease-in-out ${isLogin ? 'h-[450px]' : 'h-[520px]'}`}> {/* Dynamic height */}

            {/* Login Form */}
            <div className={`absolute top-0 left-0 w-full h-full p-8 transition-opacity duration-500 ease-in-out ${isLogin ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <CardHeader className="text-center p-0 mb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl font-poppins">
                  <LogIn className="w-6 h-6 text-[#9B8CFF]" /> Login
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Username *</Label>
                    <Input name="username" value={loginData.username} onChange={handleLoginChange} required placeholder="Enter username" />
                  </div>
                  <div className="space-y-1 relative">
                    <Label>Password *</Label>
                    <Input name="password" type={showPassword ? "text" : "password"} value={loginData.password} onChange={handleLoginChange} required placeholder="Enter password" />
                     <Button type="button" variant="ghost" size="sm" className="absolute right-1 bottom-1 h-7 w-7 px-0" onClick={() => setShowPassword(!showPassword)}>
                         {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                     </Button>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-full bg-gradient-to-r from-[#9B8CFF] to-[#89BFFF] hover:opacity-90 text-lg font-semibold shadow-xl disabled:opacity-50">
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                   <div className="text-center text-sm">
                       <Button variant="link" className="text-[#9B8CFF] hover:text-[#89BFFF] p-0 h-auto">Forgot Password?</Button>
                   </div>
                </form>
              </CardContent>
            </div>

            {/* Register Form */}
            <div className={`absolute top-0 left-0 w-full h-full p-8 transition-opacity duration-500 ease-in-out ${!isLogin ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <CardHeader className="text-center p-0 mb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl font-poppins">
                  <UserPlus className="w-6 h-6 text-[#9B8CFF]" /> Register
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Username *</Label>
                    <Input name="username" value={registerData.username} onChange={handleRegisterChange} required placeholder="Choose a username" />
                  </div>
                   <div className="space-y-1 relative">
                     <Label>Password *</Label>
                     <Input name="password" type={showPassword ? "text" : "password"} value={registerData.password} onChange={handleRegisterChange} required placeholder="Create a password"/>
                      <Button type="button" variant="ghost" size="sm" className="absolute right-1 bottom-1 h-7 w-7 px-0" onClick={() => setShowPassword(!showPassword)}>
                         {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                     </Button>
                   </div>
                   <div className="space-y-1">
                     <Label>Role *</Label>
                     <Select value={registerData.role} onValueChange={handleRoleChange} name="role">
                       <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                       <SelectContent>
                         <SelectItem value="STUDENT">Student</SelectItem>
                         <SelectItem value="FACULTY">Faculty</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-full bg-gradient-to-r from-[#9B8CFF] to-[#89BFFF] hover:opacity-90 text-lg font-semibold shadow-xl disabled:opacity-50">
                    {isLoading ? "Creating..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </div>

          </div> {/* End Relative Container */}

           {/* Toggle Button */}
           <div className="mt-6 text-center p-4 border-t">
                 <p className="text-gray-600 text-sm mb-2">
                   {isLogin ? "Don't have an account?" : "Already have an account?"}
                 </p>
                 <Button
                   variant="outline"
                   onClick={() => {
                     setIsLogin(!isLogin);
                     setMessage({ type: null, text: '' }); // Clear messages on switch
                   }}
                   className="rounded-full border-[#9B8CFF] text-[#9B8CFF] hover:bg-[#9B8CFF]/10 hover:text-[#9B8CFF]"
                 >
                   {isLogin ? "Create Account" : "Sign In"}
                 </Button>
            </div>
        </Card>
      </div>
    </div>
  );
}