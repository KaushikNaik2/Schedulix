package com.schedulix.faculty_coordination.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    // --- CORRECTION 1: Using a real relationship ---
    // Instead of a String, we now link directly to the User who created it.
    @ManyToOne(optional = false) // 'optional = false' means an announcement MUST have a faculty.
    @JoinColumn(name = "faculty_id")
    private User faculty;

    // --- CORRECTION 2: Automatic Timestamp ---
    // This annotation tells the database to automatically set the time when the announcement is created.
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}