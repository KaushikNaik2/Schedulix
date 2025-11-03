// // src/entities/User.js - Mock User entity using Local Storage

// const MOCK_USER = {
//   full_name: "Tanvi Patel",
//   email: "tanvi.patel@college.edu",
//   id: "S1001",
// };

// // Key for storing the logged-in user state
// const STORAGE_KEY = 'currentUser'; 

// // Initialize user state in localStorage if it doesn't exist (simulates login)
// if (!localStorage.getItem(STORAGE_KEY)) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER));
// }

// export const User = {
//   /**
//    * Simulates fetching the current authenticated user's details.
//    */
//   me: async () => {
//     await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async delay
//     const user = JSON.parse(localStorage.getItem(STORAGE_KEY));
//     if (!user) {
//         return Promise.reject(new Error("No active user found."));
//     }
//     return Promise.resolve(user);
//   },

//   /**
//    * Simulates user logout (clears user from local storage).
//    */
//   logout: async () => {
//     localStorage.removeItem(STORAGE_KEY);
//     console.log("User logged out successfully.");
//     window.location.href = "/"; // Redirect to refresh state
//     return Promise.resolve({ success: true });
//   }
// };