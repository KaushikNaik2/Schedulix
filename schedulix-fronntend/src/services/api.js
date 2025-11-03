// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';
let currentToken = localStorage.getItem('token') || null;

// This function is exported so AuthContext can update the token on login/logout
export const setToken = (newToken) => {
    currentToken = newToken;
};

const request = async (endpoint, options = {}) => {
    const defaultHeaders = { 'Content-Type': 'application/json', ...options.headers };
    if (currentToken && !options.noAuth) {
        defaultHeaders['Authorization'] = `Bearer ${currentToken}`;
    }

    let body = options.body;
    if (body && !(body instanceof FormData)) {
        body = JSON.stringify(body);
    } else if (body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers: defaultHeaders, body });

        if (response.status === 401 && currentToken) {
            console.error('API Unauthorized (401)');
            setToken(null);
            localStorage.removeItem('token');
            window.location.href = '/auth'; // Redirect to login
            throw new Error('Unauthorized');
        }
        if (response.status === 403) {
            console.error('API Forbidden (403)');
            throw new Error('Forbidden: You do not have permission.');
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (!response.ok) {
                // Use the specific error text from the backend
                throw new Error(data.message || data || `API Error: ${response.status}`);
            }
            return data;
        } else {
            const textData = await response.text();
            if (!response.ok) {
                // Use the specific error text from the backend
                throw new Error(textData || `API Error: ${response.status}`);
            }
            return textData;
        }
    } catch (error) {
        console.error(`API call failed: ${options.method || 'GET'} ${endpoint}`, error);
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network Error: Could not connect to the backend. Is it running?');
        }
        throw error;
    }
};

// Define specific API functions
const apiService = {
    setToken,
    login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password }, noAuth: true }),

    // --- **FIX 1: UPDATED REGISTER FUNCTION** ---
    // Sends the full data object from the new form
    register: (registerData) => request('/auth/register', {
        method: 'POST',
        body: registerData, // registerData is the full { username, password, fullName, ... } object
        noAuth: true
    }),

    // --- **FIX 2: NEW FORGOT PASSWORD FUNCTIONS** ---
    forgotStart: (username) => request('/auth/forgot/start', {
        method: 'POST',
        body: { username },
        noAuth: true
    }),
    forgotVerify: (username, answer) => request('/auth/forgot/verify', {
        method: 'POST',
        body: { username, answer },
        noAuth: true
    }),
    forgotUpdate: (username, newPassword) => request('/auth/forgot/update', {
        method: 'POST',
        body: { username, newPassword },
        noAuth: true
    }),
    // --- END OF NEW FUNCTIONS ---

    // User Endpoints
    getCurrentUser: () => request('/users/me'),
    getFacultyList: () => request('/users/faculty'),
    updateProfileInfo: (profileData) => request('/users/me/profile', { method: 'PATCH', body: profileData }),
    uploadProfilePicture: (formData) => request('/users/me/profile-picture', { method: 'POST', body: formData }),

    removeProfilePicture: () => request('/users/me/profile-picture', {
        method: 'DELETE'
    }),

    // Announcement Endpoints
    getAnnouncements: () => request('/announcements/all'),
    createAnnouncement: (title, message) => request('/announcements/create', {
        method: 'POST',
        body: { title, message }
    }),
    updateAnnouncement: (id, title, message) => request(`/announcements/${id}`, {
        method: 'PUT',
        body: { title, message }
    }),
    deleteAnnouncement: (id) => request(`/announcements/${id}`, {
        method: 'DELETE'
    }),

    // Meeting Request Endpoints
    getMyStudentRequests: () => request('/meetings/my-requests'),
    sendMeetingRequest: (facultyName, topic, meetingDate, meetingTime) => request('/meetings/request', {
        method: 'POST',
        body: { facultyName, topic, meetingDate, meetingTime }
    }),
    deleteMeetingRequest: (requestId) => request(`/meetings/${requestId}`, {
        method: 'DELETE'
    }),
    getFacultyRequests: (type = 'pending') => request(`/faculty/meetings/${type}`),
    updateMeetingRequest: (requestId, action) => request(`/faculty/meetings/${requestId}?action=${action}`, { method: 'PATCH' }),

    // Timetable Endpoints
    uploadTimetable: (formData) => request('/timetable/upload', { method: 'POST', body: formData }),
    checkAvailability: (facultyId, day, time) => {
        const params = new URLSearchParams({ facultyId, day, time });
        return request(`/timetable/availability?${params.toString()}`);
    },

    // Notification Endpoints
    getNotifications: () => request('/notifications'), // Your endpoint was /notifications
    markNotificationAsRead: (id) => request(`/notifications/${id}/read`, {
        method: 'POST' // Your endpoint was POST
    })
};

export default apiService;

