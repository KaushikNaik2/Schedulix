package com.schedulix.faculty_coordination.controller;

import com.schedulix.faculty_coordination.dto.AnnouncementDTO;
import com.schedulix.faculty_coordination.model.Announcement;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration; // <-- NEW IMPORT
import java.time.LocalDateTime; // <-- NEW IMPORT
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    // --- CREATE (No Change) ---
    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_FACULTY')")
    public ResponseEntity<AnnouncementDTO> createAnnouncement(
            @RequestBody AnnouncementDTO announcementDTO,
            @AuthenticationPrincipal User faculty) {

        Announcement announcement = new Announcement();
        announcement.setTitle(announcementDTO.getTitle());
        announcement.setMessage(announcementDTO.getMessage());
        announcement.setFaculty(faculty);

        Announcement savedAnnouncement = announcementRepository.save(announcement);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedAnnouncement));
    }

    // --- READ (No Change) ---
    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AnnouncementDTO>> getAllAnnouncements() {
        List<Announcement> announcements = announcementRepository.findAllByOrderByCreatedAtDesc();
        List<AnnouncementDTO> dtos = announcements.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // --- UPDATE (with 1-Hour Time Check) ---
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_FACULTY')")
    public ResponseEntity<?> updateAnnouncement(
            @PathVariable Long id,
            @RequestBody AnnouncementDTO updatedDto,
            @AuthenticationPrincipal User faculty) {

        Announcement announcement = announcementRepository.findById(id)
                .orElse(null);

        if (announcement == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Announcement not found.");
        }

        if (!announcement.getFaculty().getId().equals(faculty.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to update this announcement.");
        }

        // --- NEW 1-HOUR TIME CHECK ---
        LocalDateTime createdAt = announcement.getCreatedAt();
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(createdAt, now);

        if (duration.toHours() >= 1) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Cannot update an announcement after 1 hour.");
        }
        // --- END TIME CHECK ---

        announcement.setTitle(updatedDto.getTitle());
        announcement.setMessage(updatedDto.getMessage());

        Announcement savedAnnouncement = announcementRepository.save(announcement);
        return ResponseEntity.ok(convertToDto(savedAnnouncement));
    }

    // --- DELETE (with 1-Hour Time Check) ---
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_FACULTY')")
    public ResponseEntity<?> deleteAnnouncement(
            @PathVariable Long id,
            @AuthenticationPrincipal User faculty) {

        Announcement announcement = announcementRepository.findById(id)
                .orElse(null);

        if (announcement == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Announcement not found.");
        }

        if (!announcement.getFaculty().getId().equals(faculty.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to delete this announcement.");
        }

        // --- NEW 1-HOUR TIME CHECK ---
        LocalDateTime createdAt = announcement.getCreatedAt();
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(createdAt, now);

        if (duration.toHours() >= 1) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Cannot delete an announcement after 1 hour.");
        }
        // --- END TIME CHECK ---

        announcementRepository.delete(announcement);
        return ResponseEntity.ok("Announcement deleted successfully.");
    }


    // --- Helper DTO Converter (No Change) ---
    private AnnouncementDTO convertToDto(Announcement announcement) {
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setId(announcement.getId());
        dto.setTitle(announcement.getTitle());
        dto.setMessage(announcement.getMessage());
        dto.setFacultyName(announcement.getFaculty().getUsername());
        dto.setCreatedAt(announcement.getCreatedAt());
        return dto;
    }
}