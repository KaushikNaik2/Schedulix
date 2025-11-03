package com.schedulix.faculty_coordination.controller;

import com.schedulix.faculty_coordination.model.Notification;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // Logged-in user ki saari unread notifications fetch karein
    @GetMapping
    public ResponseEntity<List<Notification>> getMyUnreadNotifications(@AuthenticationPrincipal User user) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(user.getId(), false);
        return ResponseEntity.ok(notifications);
    }

    // Ek notification ko "read" mark karein
    @PostMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Notification notification = notificationRepository.findById(id).orElse(null);

        // Security check
        if (notification == null || !notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok("Notification marked as read.");
    }
}