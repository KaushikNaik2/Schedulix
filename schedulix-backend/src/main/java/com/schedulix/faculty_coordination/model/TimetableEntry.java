package com.schedulix.faculty_coordination.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import com.schedulix.faculty_coordination.model.User;
import java.time.LocalTime;
@Getter
@Setter
@Data
@Entity
@Table(name = "timetable_entries")
public class TimetableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Correct: Links to the User entity
    @ManyToOne(optional = false)
    @JoinColumn(name = "faculty_id")
    private User faculty;

    @Column(length = 100)
    private String location; // e.g., "Room 201", "Lab 317"

    @Enumerated(EnumType.STRING)
    private DayOfWeek day;

    private String subject; // e.g., "ADSA (Room 201)"
    private LocalTime startTime;
    private LocalTime endTime;
}