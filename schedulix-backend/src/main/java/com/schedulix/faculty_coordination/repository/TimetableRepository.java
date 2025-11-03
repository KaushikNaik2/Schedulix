package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.DayOfWeek;
import com.schedulix.faculty_coordination.model.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional; // <-- 1. IMPORT Optional

@Repository
public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {

    // Correct: Deletes entries based on the faculty's User ID (Long)
    void deleteByFacultyId(Long facultyId);

    // --- 2. REPLACED 'existsBy' with 'findFirstBy' ---
    // This new method returns the actual timetable entry, so we can get the location.
    Optional<TimetableEntry> findFirstByFacultyIdAndDayAndStartTimeLessThanEqualAndEndTimeGreaterThan(
            Long facultyId, DayOfWeek day,
            LocalTime timeStartQuery, LocalTime timeEndQuery
    );
    // --- END OF CHANGE ---

    // Correct: Finds all entries for a specific faculty User ID
    List<TimetableEntry> findByFacultyId(Long facultyId);

    // Added: Useful for checking availability based on Day and Faculty ID only
    List<TimetableEntry> findByFacultyIdAndDay(Long facultyId, DayOfWeek day);
}