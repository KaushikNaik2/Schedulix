package com.schedulix.faculty_coordination.service;

import com.schedulix.faculty_coordination.model.Notification;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Ek naye user ke liye notification banata hai.
     * @param user Woh user jise notification milegi
     * @param message Notification ka text
     */
    public void createNotification(User user, String message) {
        try {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setMessage(message);
            notification.setRead(false);
            // 'link' field bhi set kar sakte hain agar aapne add kiya hai
            notificationRepository.save(notification);
        } catch (Exception e) {
            // Error handling, agar notification fail hota hai toh main process nahi rukna chahiye
            System.err.println("Failed to create notification for user " + user.getUsername() + ": " + e.getMessage());
        }
    }
}