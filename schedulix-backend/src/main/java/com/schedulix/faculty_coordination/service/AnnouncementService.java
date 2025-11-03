package com.schedulix.faculty_coordination.service;

import com.schedulix.faculty_coordination.model.Announcement;
import com.schedulix.faculty_coordination.model.User; // Import the User model
import com.schedulix.faculty_coordination.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    // --- CORRECTION: Method now accepts the User object ---
    public Announcement createAnnouncement(String title, String message, User faculty) {
        Announcement announcement = new Announcement();
        announcement.setTitle(title);
        announcement.setMessage(message);
        announcement.setFaculty(faculty); // Set the full User object.
        // We no longer need to set 'createdAt' manually. The database will do it.
        return announcementRepository.save(announcement);
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }
}