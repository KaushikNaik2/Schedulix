package com.schedulix.faculty_coordination.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String role;
    private String profileImageUrl;

    // --- NEW FIELDS ---
    private String fullName;
    private String department;
    private String subjects;
    private String currentStatus; // This will be calculated and added
    private String currentLocation; // e.g., "Cabin C-5" ya "Room 201"
}