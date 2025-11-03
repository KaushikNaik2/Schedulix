// src/pages/AuthPage.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Message from '../components/Message'; // Assuming you have this component
import { Loader2, Eye, EyeOff } from 'lucide-react';
import './AuthPage.css'; // Assuming you have this CSS file

// --- Security Questions Map ---
const securityQuestions = {
    1: "In what city were you born?",
    2: "What is your oldest sibling's middle name?",
    3: "What was the name of your first pet?"
};

export default function AuthPage() {
    const [isActive, setIsActive] = useState(false); // Controls slide
    const { login, register, forgotStart, forgotVerify, forgotUpdate } = useAuth();
    const navigate = useNavigate();

    // --- Form States ---
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registerData, setRegisterData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        department: '',
        role: 'ROLE_STUDENT', // Default role
        securityQuestionIndex: 1, // Default question
        securityAnswer: ''
    });

    // --- UI/Loading States ---
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: null, text: '' });
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isQuestionOpen, setIsQuestionOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // --- Forgot Password Modal State ---
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: username, 2: answer, 3: update
    const [forgotUsername, setForgotUsername] = useState('');
    const [forgotQuestion, setForgotQuestion] = useState(''); // Text of the question
    const [forgotAnswer, setForgotAnswer] = useState('');
    const [forgotNewPassword, setForgotNewPassword] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState({ type: null, text: '' });

    // --- Helper Functions ---
    const showMessage = useCallback((type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: null, text: '' }), 5000);
    }, []);

    const showForgotMessage = useCallback((type, text) => {
        setForgotMessage({ type, text });
        setTimeout(() => setForgotMessage({ type: null, text: '' }), 5000);
    }, []);

    const handleRegisterClick = () => setIsActive(true);
    const handleLoginClick = () => setIsActive(false);

    // --- Form Input Handlers ---
    const handleLoginChange = (e) => {
        setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleRegisterChange = (e) => {
        setRegisterData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // --- Register Role/Question Select Handlers ---
    const handleRoleSelect = (role) => {
        setRegisterData(prev => ({ ...prev, role: role }));
        setIsRoleOpen(false);
    };
    const handleQuestionSelect = (index) => {
        setRegisterData(prev => ({ ...prev, securityQuestionIndex: index }));
        setIsQuestionOpen(false);
    };

    // --- Main Form Submit Handlers ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: null, text: '' });
        try {
            await login(loginData.username, loginData.password);
            showMessage('success', 'Login successful! Redirecting...');
            navigate('/');
        } catch (error) {
            showMessage('error', error.message || 'Login failed.');
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: null, text: '' });

        // Client-side validation
        // Backend validation patterns (from AuthService.java)
        const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.*[^a-zA-Z0-9]).{8,}$/;

        if (!usernameRegex.test(registerData.username)) {
            showMessage('error', 'Username must be 3-20 alphanumeric characters.');
            setLoading(false);
            return;
        }
        if (!passwordRegex.test(registerData.password)) {
            showMessage('error', 'Password: 8+, 1 uppercase, 1 lowercase, 1 number, no special chars.');
            setLoading(false);
            return;
        }
        if (registerData.securityAnswer.trim() === '') {
            showMessage('error', 'Security answer cannot be empty.');
            setLoading(false);
            return;
        }

        try {
            const responseText = await register(registerData);
            showMessage('success', `${responseText}. Please log in.`);
            setIsActive(false); // Slide to login
            setRegisterData({ // Clear form
                username: '', password: '', fullName: '', email: '', department: '',
                role: 'ROLE_STUDENT', securityQuestionIndex: 1, securityAnswer: ''
            });
        } catch (error) {
            showMessage('error', error.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    // --- Forgot Password Modal Handlers ---

    const openForgotModal = (e) => {
        e.preventDefault();
        setShowForgotModal(true);
        setForgotStep(1);
        setForgotMessage({ type: null, text: '' });
        setForgotUsername('');
        setForgotAnswer('');
        setForgotNewPassword('');
    };

    const closeForgotModal = () => setShowForgotModal(false);

    // Step 1: Submit Username
    const handleForgotStart = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotMessage({ type: null, text: '' });
        try {
            const response = await forgotStart(forgotUsername);
            // response = { securityQuestionIndex: 1 }
            setForgotQuestion(securityQuestions[response.securityQuestionIndex]);
            setForgotStep(2); // Move to next step
            setForgotMessage({ type: 'info', text: 'User found. Please answer your question.' });
        } catch (error) {
            showForgotMessage('error', error.message || 'Failed to find user.');
        } finally {
            setForgotLoading(false);
        }
    };

    // Step 2: Submit Answer
    const handleForgotVerify = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotMessage({ type: null, text: '' });
        try {
            await forgotVerify(forgotUsername, forgotAnswer);
            setForgotStep(3); // Move to final step
            setForgotMessage({ type: 'success', text: 'Answer correct! Please set a new password.' });
        } catch (error) {
            showForgotMessage('error', error.message || 'Incorrect answer.');
        } finally {
            setForgotLoading(false);
        }
    };

    // Step 3: Submit New Password
    const handleForgotUpdate = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotMessage({ type: null, text: '' });

        // Client-side validation for new password
        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.*[^a-zA-Z0-9]).{8,}$/;
        if (!passwordRegex.test(forgotNewPassword)) {
            showForgotMessage('error', 'Password: 8+, 1 uppercase, 1 lowercase, 1 number, no special chars.');
            setForgotLoading(false);
            return;
        }

        try {
            await forgotUpdate(forgotUsername, forgotNewPassword);
            showForgotMessage('success', 'Password updated! Please log in.');
            // Close modal after a delay
            setTimeout(() => {
                closeForgotModal();
            }, 2000);
        } catch (error) {
            showForgotMessage('error', error.message || 'Failed to update password.');
        } finally {
            setForgotLoading(false);
        }
    };

    // Fix for the 'isLogin is not defined' error
    const isLoginView = !isActive;

    return (
        <div className="auth-page-wrapper">
            <div className={`container ${isActive ? 'active' : ''}`} id="container">

                {/* --- Registration Form (sign-up) --- */}
                <div className="form-container sign-up">
                    <form onSubmit={handleRegisterSubmit}>
                        <h1>Register</h1>

                        {message.text && !isLoginView && <Message message={message} />}

                        <input type="text" name="username" placeholder="Username (e.g., kkaushik10)" value={registerData.username} onChange={handleRegisterChange} required />

                        {/* Password with Show/Hide */}
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={registerData.password}
                                onChange={handleRegisterChange}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* --- Custom Role Selection --- */}
                        <div className="role-dropdown-container">
                            <button type="button" className="role-display-button" onClick={() => setIsRoleOpen(!isRoleOpen)}>
                                {registerData.role.replace('ROLE_', '')}
                            </button>
                            {isRoleOpen && (
                                <div className="role-options">
                                    <button type="button" onClick={() => handleRoleSelect('ROLE_STUDENT')}>STUDENT</button>
                                    <button type="button" onClick={() => handleRoleSelect('ROLE_FACULTY')}>FACULTY</button>
                                </div>
                            )}
                        </div>

                        {/* --- Security Question Selection --- */}
                        <div className="role-dropdown-container">
                            <button typeD="button" className="role-display-button" onClick={() => setIsQuestionOpen(!isQuestionOpen)}>
                                {securityQuestions[registerData.securityQuestionIndex]}
                            </button>
                            {isQuestionOpen && (
                                <div className="role-options">
                                    <button type="button" onClick={() => handleQuestionSelect(1)}>{securityQuestions[1]}</button>
                                    <button type="button" onClick={() => handleQuestionSelect(2)}>{securityQuestions[2]}</button>
                                    <button type="button" onClick={() => handleQuestionSelect(3)}>{securityQuestions[3]}</button>
                                </div>
                            )}
                        </div>
                        <input type="text" name="securityAnswer" placeholder="Your Answer" value={registerData.securityAnswer} onChange={handleRegisterChange} required />

                        <button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Register'}
                        </button>
                    </form>
                </div>

                {/* --- Login Form (sign-in) --- */}
                <div className="form-container sign-in">
                    <form onSubmit={handleLoginSubmit}>
                        <h1>Login</h1>

                        {message.text && isLoginView && <Message message={message} />}

                        <input type="text" name="username" placeholder="Username" value={loginData.username} onChange={handleLoginChange} required />

                        {/* Password with Show/Hide */}
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <a href="#" onClick={openForgotModal}>Forgot Your Password?</a>
                        <button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Login'}
                        </button>
                    </form>
                </div>

                {/* --- The Sliding Toggle Container --- */}
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>Welcome to Schedulix</h1>
                            <p>Already have an account?.</p>
                            <button type="button" className="hidden" onClick={handleLoginClick}>Login</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>Welcome to Schedulix</h1>
                            <p>Don't have an account?</p>
                            <button type="button" className="hidden" onClick={handleRegisterClick}>Register</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FORGOT PASSWORD MODAL --- */}
            {showForgotModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <button onClick={closeForgotModal} className="modal-close-button">&times;</button>

                        {/* Step 1: Enter Username */}
                        {forgotStep === 1 && (
                            <form onSubmit={handleForgotStart}>
                                <h2>Forgot Password (Step 1/3)</h2>
                                <p>Please enter your username to find your account.</p>
                                {forgotMessage.text && <Message message={forgotMessage} />}
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={forgotUsername}
                                    onChange={(e) => setForgotUsername(e.target.value)}
                                    required
                                />
                                <button type="submit" disabled={forgotLoading}>
                                    {forgotLoading ? <Loader2 className="animate-spin" size={16} /> : 'Find Account'}
                                </button>
                            </form>
                        )}

                        {/* Step 2: Answer Question */}
                        {forgotStep === 2 && (
                            <form onSubmit={handleForgotVerify}>
                                <h2>Forgot Password (Step 2/3)</h2>
                                <p>Please answer your security question:</p>
                                <strong>{forgotQuestion}</strong>
                                {forgotMessage.text && <Message message={forgotMessage} />}
                                <input
                                    type="text"
                                    placeholder="Your Answer"
                                    value={forgotAnswer}
                                    onChange={(e) => setForgotAnswer(e.target.value)}
                                    required
                                />
                                <button type="submit" disabled={forgotLoading}>
                                    {forgotLoading ? <Loader2 className="animate-spin" size={16} /> : 'Verify Answer'}
                                </button>
                            </form>
                        )}

                        {/* Step 3: Update Password */}
                        {forgotStep === 3 && (
                            <form onSubmit={handleForgotUpdate}>
                                <h2>Forgot Password (Step 3/3)</h2>
                                <p>Please enter a new password for <strong>{forgotUsername}</strong>.</p>
                                {forgotMessage.text && <Message message={forgotMessage} />}
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={forgotNewPassword}
                                    onChange={(e) => setForgotNewPassword(e.target.value)}
                                    required
                                />
                                <p className="password-hint">8+ chars, 1 uppercase, 1 lowercase, 1 number, no special chars.</p>
                                <button type="submit" disabled={forgotLoading}>
                                    {forgotLoading ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
                                </button>
                            </form>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}
