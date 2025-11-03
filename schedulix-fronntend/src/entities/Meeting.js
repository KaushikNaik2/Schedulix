// // src/entities/Meeting.js - Mock Meeting entity using Local Storage

// // Initial data (using today's date + some future dates)
// const INITIAL_MEETING_DATA = [
//   // Mock meeting for the default user "tanvi.patel@college.edu"
//   {
//     id: "M001",
//     faculty_id: "F001",
//     faculty_name: "Dr. Riya Sharma",
//     student_email: "tanvi.patel@college.edu",
//     student_name: "Tanvi Patel",
//     meeting_date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], // Day after tomorrow
//     meeting_time: "11:30 AM",
//     purpose: "Discuss final-year project idea",
//     status: "Confirmed",
//     meeting_location: "Block A - Room 204",
//   },
//   // Mock meeting for another user or pending
//   {
//     id: "M002",
//     faculty_id: "F002",
//     faculty_name: "Prof. Aarav Mehta",
//     student_email: "another.user@college.edu",
//     student_name: "Rohan Kumar",
//     meeting_date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
//     meeting_time: "02:00 PM",
//     purpose: "Clarify doubts on networking lab",
//     status: "Pending",
//     meeting_location: "Block B - Room 101",
//   }
// ];

// const STORAGE_KEY = 'meetingsData';

// // Initialize data in localStorage if not present
// if (!localStorage.getItem(STORAGE_KEY)) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEETING_DATA));
// }

// export const Meeting = {
//   /**
//    * Simulates filtering and retrieving meetings.
//    */
//   filter: async (filter, sort, limit) => {
//     await new Promise(resolve => setTimeout(resolve, 300)); // Simulate async delay
//     const allMeetings = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
//     let filtered = allMeetings.filter(m => {
//         // Check student email
//         if (filter.student_email && m.student_email !== filter.student_email) return false;
//         // Check status
//         if (filter.status && m.status !== filter.status) return false;
//         // Check date (only show future meetings for dashboard)
//         const meetingDateTime = new Date(`${m.meeting_date} ${m.meeting_time.replace(' ', '')}`);
//         if (meetingDateTime < new Date()) return false;
//         return true;
//     });

//     // Simple sort mock (sort by date ascending)
//     filtered.sort((a, b) => {
//         const dateA = new Date(a.meeting_date);
//         const dateB = new Date(b.meeting_date);
//         return dateA.getTime() - dateB.getTime();
//     });

//     return Promise.resolve(filtered.slice(0, limit));
//   },

//   /**
//    * Simulates creating a new meeting.
//    */
//   create: async (meetingData) => {
//     await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
//     const allMeetings = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
//     const newMeeting = {
//         ...meetingData,
//         id: "M" + (allMeetings.length + 1).toString().padStart(3, '0'),
//     };
    
//     allMeetings.push(newMeeting);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(allMeetings));
//     console.log("Meeting created in Local Storage:", newMeeting);
//     return Promise.resolve({ success: true, ...newMeeting });
//   },

//   updateStatus: async (meetingId, newStatus) => {
//     // This method is not used in the provided code but kept for completeness
//     console.log(`Meeting ${meetingId} status updated to ${newStatus}`);
//     return Promise.resolve({ success: true, status: newStatus });
//   }
// };