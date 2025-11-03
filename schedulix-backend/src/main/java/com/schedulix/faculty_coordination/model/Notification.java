package com.schedulix.faculty_coordination.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) // Is notification ko kaun receive karega
    private User user;

    @Column(nullable = false)
    private String message; // Notification ka text

    private boolean isRead = false; // Kya user ne ise padh liya hai?

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Aap ek "link" field bhi add kar sakte hain (jaise "/student/meetings")
    // @Column
    // private String link;
}