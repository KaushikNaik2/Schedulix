package com.schedulix.faculty_coordination.service;

import com.schedulix.faculty_coordination.model.MeetingRequest;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.MeetingRequestRepository;
import com.schedulix.faculty_coordination.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate; // <-- IMPORT BARU
import java.time.LocalTime; // <-- IMPORT BARU
import com.schedulix.faculty_coordination.service.NotificationService;

@Service
public class MeetingRequestService {

    @Autowired
    private MeetingRequestRepository meetingRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Method diupdate untuk menerima tanggal dan waktu
     */
    public MeetingRequest createRequest(User student, String facultyName, String topic, LocalDate date, LocalTime time) {
        // Step 1: Cari faculty berdasarkan nama
        User faculty = userRepository.findByUsername(facultyName)
                .orElseThrow(() -> new EntityNotFoundException("Faculty with name '" + facultyName + "' not found."));

        // Step 2: Buat objek request baru
        MeetingRequest request = new MeetingRequest();

        // Step 3: Set field
        request.setStudent(student);
        request.setFaculty(faculty);
        request.setTopic(topic);

        // --- TAMBAHAN BARU ---
        request.setMeetingDate(date);
        request.setMeetingTime(time);
        // --- AKHIR TAMBAHAN ---

        // Status akan di-set ke PENDING oleh @PrePersist di Entity

        // Step 4: Simpan dan kembalikan

        // Faculty ko notification bhejein
        String message = "You have a new meeting request from " + student.getUsername() + ".";
        notificationService.createNotification(faculty, message);

        return meetingRequestRepository.save(request);
    }
}