package com.schedulix.faculty_coordination.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AnnouncementDTO {
    private Long id;
    private String title;
    private String message;
    private String facultyName; // We'll send the name as a simple String.
    private LocalDateTime createdAt;
}