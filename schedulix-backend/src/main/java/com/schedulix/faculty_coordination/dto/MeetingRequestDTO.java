package com.schedulix.faculty_coordination.dto;

import com.schedulix.faculty_coordination.model.MeetingRequestStatus;
import lombok.AllArgsConstructor; // <-- IMPORT BARU
import lombok.Data;
import lombok.NoArgsConstructor; // <-- IMPORT BARU
import java.time.LocalDate; // <-- IMPORT BARU
import java.time.LocalTime; // <-- IMPORT BARU

@Data
@NoArgsConstructor // <-- TAMBAHAN BARU
@AllArgsConstructor // <-- TAMBAHAN BARU
public class MeetingRequestDTO {

    private Long id;
    private String studentName;
    private String facultyName;
    private String topic;
    private MeetingRequestStatus status;

    // --- TAMBAHAN BARU ---
    private LocalDate meetingDate;
    private LocalTime meetingTime;
    // --- AKHIR TAMBAHAN ---
    private String studentProfileImageUrl;
    private String facultyProfileImageUrl;
}