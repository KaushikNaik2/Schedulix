package com.schedulix.faculty_coordination.controller;

import com.schedulix.faculty_coordination.dto.MeetingRequestDTO;
import com.schedulix.faculty_coordination.model.MeetingRequest;
import com.schedulix.faculty_coordination.model.MeetingRequestStatus;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.MeetingRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.schedulix.faculty_coordination.service.NotificationService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasAuthority('ROLE_FACULTY')") // Secures all endpoints
public class FacultyController {

    @Autowired
    private MeetingRequestRepository meetingRequestRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Gets only the PENDING meeting requests for the logged-in faculty,
     * sorted by newest first.
     */
    @GetMapping("/meetings/pending")
    public ResponseEntity<List<MeetingRequestDTO>> getMyPendingRequests(@AuthenticationPrincipal User loggedInUser) {

        // --- THIS IS THE FIX ---
        // Call the new method that sorts by ID in descending order (newest first)
        List<MeetingRequest> pendingRequests = meetingRequestRepository.findByFacultyIdAndStatusOrderByIdDesc(
                loggedInUser.getId(),
                MeetingRequestStatus.PENDING
        );
        // --- END OF FIX ---

        List<MeetingRequestDTO> dtos = pendingRequests.stream().map(this::convertToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Gets ALL meeting requests (pending, approved, denied) for the logged-in faculty.
     */
    @GetMapping("/meetings/all")
    public ResponseEntity<List<MeetingRequestDTO>> getAllMyRequests(@AuthenticationPrincipal User faculty) {
        // --- YEH LINE CHANGE HUI HAI ---
        List<MeetingRequest> requests = meetingRequestRepository.findByFacultyIdOrderByIdDesc(faculty.getId());
        // --- END CHANGE ---
        List<MeetingRequestDTO> dtos = requests.stream().map(this::convertToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Approves or denies a specific meeting request.
     */
    @PatchMapping("/meetings/{requestId}")
    public ResponseEntity<String> updateRequestStatus(
            @PathVariable Long requestId,
            @RequestParam("action") String action,
            @AuthenticationPrincipal User loggedInUser) {

        Optional<MeetingRequest> optionalRequest = meetingRequestRepository.findById(requestId);

        if (optionalRequest.isEmpty()) {
            return ResponseEntity.status(404).body("Meeting request not found.");
        }

        MeetingRequest request = optionalRequest.get();

        // Security check: Ensure the faculty is only modifying their own requests.
        if (!request.getFaculty().getId().equals(loggedInUser.getId())) {
            return ResponseEntity.status(403).body("Forbidden: You cannot modify this request.");
        }

        if ("approve".equalsIgnoreCase(action)) {
            request.setStatus(MeetingRequestStatus.APPROVED);
        } else if ("deny".equalsIgnoreCase(action)) {
            request.setStatus(MeetingRequestStatus.DENIED);
        } else {
            return ResponseEntity.badRequest().body("Invalid action. Use 'approve' or 'deny'.");
        }

        // Student ko notification bhejein
        String status = request.getStatus().toString().toLowerCase();
        String message = "Your meeting request for '" + request.getTopic() + "' was " + status + ".";
        notificationService.createNotification(request.getStudent(), message);
        // --- END ---

        meetingRequestRepository.save(request);
        return ResponseEntity.ok("Request has been successfully " + request.getStatus().toString().toLowerCase() + ".");
    }

    /**
     * Helper method to convert a MeetingRequest entity into a rich DTO.
     * (Includes date, time, and profile image URLs)
     */
    private MeetingRequestDTO convertToDto(MeetingRequest request) {
        MeetingRequestDTO dto = new MeetingRequestDTO();

        dto.setId(request.getId());
        dto.setStudentName(request.getStudent().getUsername());
        dto.setFacultyName(request.getFaculty().getUsername());
        dto.setTopic(request.getTopic());
        dto.setStatus(request.getStatus());
        dto.setMeetingDate(request.getMeetingDate());
        dto.setMeetingTime(request.getMeetingTime());

        // --- ADDED PROFILE IMAGE URLs (to match MeetingRequestController) ---
        dto.setStudentProfileImageUrl(request.getStudent().getProfileImageUrl());
        dto.setFacultyProfileImageUrl(request.getFaculty().getProfileImageUrl());

        return dto;
    }
}