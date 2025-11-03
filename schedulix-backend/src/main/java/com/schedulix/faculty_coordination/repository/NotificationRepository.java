package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // User ki saari unread notifications lao, sabse nayi upar
    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(Long userId, boolean isRead);

    // User ki saari notifications lao (read aur unread dono)
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // User ki saari unread notifications ka count karo
    long countByUserIdAndIsRead(Long userId, boolean isRead);
}