package com.schedulix.faculty_coordination.controller;

import com.schedulix.faculty_coordination.dto.MeetingRequestDTO;
import com.schedulix.faculty_coordination.model.MeetingRequest;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.MeetingRequestRepository;
import com.schedulix.faculty_coordination.service.MeetingRequestService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/meetings")
public class MeetingRequestController {

    @Autowired
    private MeetingRequestService meetingRequestService;

    @Autowired
    private MeetingRequestRepository meetingRequestRepository;

    /**
     * Endpoint to create a new meeting request
     */
    @PostMapping("/request")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<?> createRequest(@RequestBody Map<String, String> payload, @AuthenticationPrincipal User student) {

        String facultyName = payload.get("facultyName");
        String topic = payload.get("topic");
        String dateStr = payload.get("meetingDate"); // Ambil date string
        String timeStr = payload.get("meetingTime"); // Ambil time string

        // Validate input
        if (facultyName == null || topic == null || dateStr == null || timeStr == null) {
            return ResponseEntity.badRequest().body("Missing required fields: facultyName, topic, meetingDate, or meetingTime.");
        }

        LocalDate meetingDate;
        LocalTime meetingTime;
        try {
            // Parse strings to Java Date/Time objects
            meetingDate = LocalDate.parse(dateStr); // Expects "yyyy-MM-dd"
            meetingTime = LocalTime.parse(timeStr); // Expects "HH:mm"
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid date or time format. Use 'yyyy-MM-dd' and 'HH:mm'.");
        }

        try {
            // Call the service with all parameters
            MeetingRequest savedRequest = meetingRequestService.createRequest(student, facultyName, topic, meetingDate, meetingTime);
            // Return the complete DTO
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedRequest));
        } catch (EntityNotFoundException e) {
            // Handle case where faculty username is not found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Endpoint to get all requests for the logged-in student
     */
    @GetMapping("/my-requests")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<List<MeetingRequestDTO>> getMyRequests(@AuthenticationPrincipal User student) {
        // --- YEH LINE CHANGE HUI HAI ---
        List<MeetingRequest> requests = meetingRequestRepository.findByStudentIdOrderByIdDesc(student.getId());
        // --- END CHANGE ---

        List<MeetingRequestDTO> dtos = requests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // --- NEW METHOD ADDED ---
    /**
     * Endpoint for a STUDENT to delete their own meeting request.
     */
    @DeleteMapping("/{requestId}")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<String> deleteRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal User student) {

        // 1. Find the request
        MeetingRequest request = meetingRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Meeting request not found with id: " + requestId));

        // 2. Security Check: Is this student the owner of the request?
        if (!request.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to delete this request.");
        }

        // 3. (Optional) Business Logic: Maybe you only let them delete PENDING requests
        // if (request.getStatus() != MeetingRequestStatus.PENDING) {
        //     return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        //                          .body("Cannot delete a request that is already " + request.getStatus());
        // }

        // 4. Delete the request
        meetingRequestRepository.delete(request);

        return ResponseEntity.ok("Meeting request successfully deleted.");
    }
    // --- END OF NEW METHOD ---


    /**
     * Helper method to convert a MeetingRequest entity to a rich DTO
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

        // Add the profile image URLs from the User objects
        dto.setStudentProfileImageUrl(request.getStudent().getProfileImageUrl());
        dto.setFacultyProfileImageUrl(request.getFaculty().getProfileImageUrl());

        return dto;
    }
}