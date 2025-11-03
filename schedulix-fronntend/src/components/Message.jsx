// src/components/Message.jsx
import React from 'react';

// Make sure styles are defined (e.g., in App.css or AuthPage.css)
// .message { ... }
// .message-success { ... }
// .message-error { ... }
// .message-info { ... }

const Message = ({ message }) => {
    // Check if message object or message text exists
    if (!message || !message.text) {
        return null; // Don't render anything if no message
    }

    // Determine CSS class based on message type
    const colors = {
        success: "message-success",
        error: "message-error",
        info: "message-info",
    };
    const messageClass = `message ${colors[message.type] || colors.info}`;

    return (
        <div className={messageClass}>
            {message.text}
        </div>
    );
};

// --- THIS LINE IS IMPORTANT ---
export default Message; // Make sure this default export exists