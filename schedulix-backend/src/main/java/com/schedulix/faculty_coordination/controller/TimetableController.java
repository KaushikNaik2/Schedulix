package com.schedulix.faculty_coordination.controller;

import com.schedulix.faculty_coordination.dto.TimetableEntryDTO;
import com.schedulix.faculty_coordination.model.DayOfWeek;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.service.TimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    @Autowired
    private TimetableService timetableService;

    // --- CORRECTION 1: Endpoint is now SECURED for faculty only ---
    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('ROLE_FACULTY')")
    public ResponseEntity<String> uploadTimetable(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal User faculty) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please select an Excel file to upload.");
        }
        try {
            // --- CORRECTION 2: Pass the logged-in faculty to the service ---
            timetableService.saveTimetableFromExcel(file, faculty);
            return ResponseEntity.ok("Timetable uploaded and saved successfully for " + faculty.getUsername());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process the Excel file: " + e.getMessage());
        }
    }

    // --- CORRECTION 3: Endpoint is secured for any authenticated user ---
    @GetMapping("/availability")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> checkFacultyAvailability(
            @RequestParam Long facultyId, // Changed to Long to match User ID
            @RequestParam String day,
            @RequestParam @DateTimeFormat(pattern = "H:mm") LocalTime time) {
        try {
            DayOfWeek dayEnum = DayOfWeek.valueOf(day.toUpperCase());
            String availability = timetableService.checkFacultyAvailability(facultyId, dayEnum, time);
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error checking availability: " + e.getMessage());
        }
    }
}