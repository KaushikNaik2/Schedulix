package com.schedulix.faculty_coordination.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate; // <-- IMPORT BARU
import java.time.LocalTime; // <-- IMPORT BARU

@Data
@Entity
@Table(name = "meeting_requests")
public class MeetingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "faculty_id", nullable = false)
    private User faculty;

    private String topic;

    @Enumerated(EnumType.STRING)
    private MeetingRequestStatus status;

    // --- TAMBAHAN BARU ---
    @Column(nullable = true) // Ganti ke false jika wajib diisi
    private LocalDate meetingDate;

    @Column(nullable = true) // Ganti ke false jika wajib diisi
    private LocalTime meetingTime;
    // --- AKHIR TAMBAHAN ---

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = MeetingRequestStatus.PENDING;
        }
    }
}