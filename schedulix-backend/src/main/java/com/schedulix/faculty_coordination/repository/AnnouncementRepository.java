package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    // Sabse naye announcements ko pehle laane ke liye
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
