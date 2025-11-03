// // src/entities/Faculty.js - Mock Faculty entity using Local Storage

// const INITIAL_FACULTY_DATA = [
//   {
//     id: "F001",
//     full_name: "Dr. Riya Sharma",
//     email: "riya.sharma@university.edu",
//     department: "Computer Science",
//     current_status: "Available",
//     office_location: "Block A - Room 204",
//     phone: "+91 98765 43210",
//     bio: "Expert in Artificial Intelligence and Cloud Computing.",
//     profile_image: "https://randomuser.me/api/portraits/women/44.jpg"
//   },
//   {
//     id: "F002",
//     full_name: "Prof. Aarav Mehta",
//     email: "aarav.mehta@university.edu",
//     department: "Information Technology",
//     current_status: "In Class",
//     office_location: "Block B - Room 101",
//     phone: "+91 91234 56789",
//     bio: "Specializes in Networks and Distributed Systems.",
//     profile_image: "https://randomuser.me/api/portraits/men/32.jpg"
//   },
//   {
//     id: "F003",
//     full_name: "Dr. Sandeep Singh",
//     email: "sandeep.singh@university.edu",
//     department: "Mechanical Engineering",
//     current_status: "Off Campus",
//     office_location: "Workshop Building - 305",
//     phone: "+91 90000 11111",
//     bio: "Focuses on Robotics and CAD.",
//     profile_image: "https://randomuser.me/api/portraits/men/19.jpg"
//   },
//   {
//     id: "F004",
//     full_name: "Dr. Lina Khan",
//     email: "lina.khan@university.edu",
//     department: "Applied Mathematics",
//     current_status: "Available",
//     office_location: "Main Tower - 501",
//     phone: "+91 92222 33333",
//     bio: "Research in theoretical physics.",
//     profile_image: "https://randomuser.me/api/portraits/women/61.jpg"
//   }
// ];

// const STORAGE_KEY = 'facultyData'; 

// // Initialize data in localStorage if not present
// if (!localStorage.getItem(STORAGE_KEY)) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FACULTY_DATA));
// }

// export const Faculty = {
//   /**
//    * Simulates listing all faculty members.
//    */
//   list: async (sortField) => {
//     await new Promise(resolve => setTimeout(resolve, 300)); // Simulate async delay
//     const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
//     // Simple sort mock (if needed, but not strictly required for current code)
//     if (sortField) {
//         // Simple mock: sort by name if no specific logic needed
//     }
    
//     return Promise.resolve(data);
//   }
// };