package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.MeetingRequest;
import com.schedulix.faculty_coordination.model.MeetingRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // <-- 1. IMPORT @Repository

import java.util.List;

@Repository // <-- 2. ADD @Repository annotation
public interface MeetingRequestRepository extends JpaRepository<MeetingRequest, Long> {

    // --- 3. THIS IS THE CORRECTED METHOD NAME ---
    // For the faculty dashboard (pending requests), sorted by newest first
    List<MeetingRequest> findByFacultyIdAndStatusOrderByIdDesc(Long facultyId, MeetingRequestStatus status);

    // For a student to see all their sent requests (sorted by status)
    List<MeetingRequest> findByStudentIdOrderByIdDesc(Long studentId);
    // For a faculty to see all their received requests (sorted by status)
    List<MeetingRequest> findByFacultyIdOrderByIdDesc(Long facultyId);
}