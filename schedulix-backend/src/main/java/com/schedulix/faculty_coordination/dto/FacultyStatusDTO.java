package com.schedulix.faculty_coordination.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor // Isse constructor apne aap ban jaayega
public class FacultyStatusDTO {
    private String facultyId;
    private String status; // Jaise "AVAILABLE" ya "BUSY"
    private String currentActivity; // Jaise "In a lecture: Physics" ya "Free"
}

