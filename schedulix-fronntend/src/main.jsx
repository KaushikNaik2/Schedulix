import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { BrowserRouter } from 'react-router-dom'; // <-- 2. IMPORT ROUTER
import './index.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* 2. WRAP YOUR APP */}
            <AuthProvider>
                {/* 3. Wrap App in BrowserRouter */}
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AuthProvider>

    </React.StrictMode>,
);