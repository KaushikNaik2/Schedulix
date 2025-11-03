package com.schedulix.faculty_coordination.controller;

import com.schedulix.faculty_coordination.dto.UserDTO;
import com.schedulix.faculty_coordination.model.TimetableEntry; // <-- 1. IMPORT TimetableEntry
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.UserRepository;
import com.schedulix.faculty_coordination.repository.TimetableRepository;
import com.schedulix.faculty_coordination.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional; // <-- 2. IMPORT Optional
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private TimetableRepository timetableRepository;

    /**
     * Endpoint to get details of the currently logged-in user.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) { return ResponseEntity.status(401).build(); }
        User userFromDb = userRepository.findById(currentUser.getId()).orElse(currentUser);
        UserDTO userDTO = convertUserToRichDto(userFromDb);
        return ResponseEntity.ok(userDTO);
    }

    /**
     * Endpoint to get a list of all faculty members.
     */
    @GetMapping("/faculty")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserDTO>> getAllFaculty() {
        List<User> facultyUsers = userRepository.findByRole("ROLE_FACULTY");
        List<UserDTO> facultyDtos = facultyUsers.stream()
                .map(this::convertUserToRichDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(facultyDtos);
    }

    /**
     * Endpoint for Profile Picture Upload.
     */
    @PostMapping("/me/profile-picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("profileImage") MultipartFile file, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body("User not authenticated.");
        }
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }
        try {
            String fileUrlPath = fileStorageService.storeFile(file, currentUser.getId());
            currentUser.setProfileImageUrl(fileUrlPath);
            User savedUser = userRepository.save(currentUser);
            UserDTO updatedUser = convertUserToRichDto(savedUser);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not upload the file: " + e.getMessage());
        }
    }

    /**
     * Endpoint for a user to update their own text-based profile info.
     */
    @PatchMapping("/me/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> updateProfileInfo(@AuthenticationPrincipal User currentUser, @RequestBody Map<String, String> updates) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        // Check the 'updates' map and set fields if they exist
        if (updates.containsKey("fullName")) {
            currentUser.setFullName(updates.get("fullName"));
        }
        if (updates.containsKey("department")) {
            currentUser.setDepartment(updates.get("department"));
        }
        if (updates.containsKey("subjects")) {
            currentUser.setSubjects(updates.get("subjects"));
        }

        // --- 3. THIS IS THE ADDED CODE ---
        if (updates.containsKey("officeLocation")) {
            currentUser.setOfficeLocation(updates.get("officeLocation"));
        }
        // --- END OF ADDED CODE ---

        User savedUser = userRepository.save(currentUser);
        return ResponseEntity.ok(convertUserToRichDto(savedUser));
    }
    @DeleteMapping("/me/profile-picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> removeProfilePicture(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 1. (Optional) Purani image file ko server se delete karein
        // String oldImageUrl = currentUser.getProfileImageUrl();
        // if (oldImageUrl != null) {
        //     fileStorageService.deleteFile(oldImageUrl); // Iske liye FileStorageService mein deleteFile method banana hoga
        // }

        // 2. Database mein image URL ko null set karein
        currentUser.setProfileImageUrl(null);
        User savedUser = userRepository.save(currentUser);

        // 3. Updated user (bina image URL ke) return karein
        return ResponseEntity.ok(convertUserToRichDto(savedUser));
    }


    /**
     * Helper method to convert a User entity to a rich UserDTO
     * (This is the new, fully updated version)
     */
    private UserDTO convertUserToRichDto(User user) {

        String status;
        String location;

        try {
            // --- 1. College Timings Define Karein ---
            final LocalTime collegeStartTime = LocalTime.of(8, 10); // 8:10 AM
            final LocalTime collegeEndTime = LocalTime.of(17, 0); // 5:00 PM

            LocalTime now = LocalTime.now();
            java.time.DayOfWeek javaDay = LocalDate.now().getDayOfWeek();

            // --- 2. Check Karein ki College Hours ke Bahar hain ya Weekend hai ---
            if (now.isBefore(collegeStartTime) || now.isAfter(collegeEndTime) ||
                    javaDay == java.time.DayOfWeek.SATURDAY || javaDay == java.time.DayOfWeek.SUNDAY) {

                status = "Offline"; // Ya "Off Campus"
                location = "N/A"; // Ya "Offline"

            } else {
                // --- 3. Hum College Hours ke ANDAR hain. Ab Timetable check karein. ---
                com.schedulix.faculty_coordination.model.DayOfWeek todayEnum = null;
                try {
                    todayEnum = com.schedulix.faculty_coordination.model.DayOfWeek.valueOf(javaDay.name());
                } catch (IllegalArgumentException e) {
                    todayEnum = null; // Agar aapke enum mein MONDAY, etc. nahi hai
                }

                if (todayEnum != null) {
                    // Check karein ki current time par koi entry hai ya nahi
                    Optional<TimetableEntry> currentEntryOpt = timetableRepository
                            .findFirstByFacultyIdAndDayAndStartTimeLessThanEqualAndEndTimeGreaterThan(
                                    user.getId(), todayEnum, now, now
                            );

                    if (currentEntryOpt.isPresent()) {
                        // Faculty BUSY hai (In Class)
                        TimetableEntry currentEntry = currentEntryOpt.get();
                        status = "In Class";
                        // Location ko timetable entry se lein
                        location = currentEntry.getLocation() != null ? currentEntry.getLocation() : "On Campus";
                    } else {
                        // Faculty FREE hai (Available)
                        status = "Available";
                        // Default location (Cabin) ko profile se lein
                        location = user.getOfficeLocation() != null && !user.getOfficeLocation().isEmpty()
                                ? user.getOfficeLocation()
                                : "Cabin"; // Default agar officeLocation set nahi hai
                    }
                } else {
                    // Fallback (agar MONDAY etc. match nahi hua)
                    status = "Offline";
                    location = "N/A";
                }
            }

        } catch (Exception e) {
            System.err.println("Error checking availability for user " + user.getId() + ": " + e.getMessage());
            status = "Status Unknown";
            location = "N/A";
        }

        // DTO ko poora data return karein
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getProfileImageUrl(),
                user.getFullName(),
                user.getDepartment(),
                user.getSubjects(),
                status, // Naya calculated status
                location // Naya calculated location
        );
    }
}