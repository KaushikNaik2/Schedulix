package com.schedulix.faculty_coordination.service;

import com.schedulix.faculty_coordination.dto.RegisterRequest;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- Validation Patterns ---
    // Username: Alphanumeric, 3-20 characters.
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9]{3,20}$");
    // Password: At least 1 digit, 1 lowercase, 1 uppercase, 8+ characters, no special characters.
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.*[^a-zA-Z0-9]).{8,}$");


    public void registerUser(RegisterRequest request) {
        // 1. Validate Username
        String username = request.getUsername();
        if (username == null || !USERNAME_PATTERN.matcher(username).matches()) {
            throw new IllegalArgumentException("Invalid username format. Must be 3-20 alphanumeric characters.");
        }

        // 2. Validate Password
        String password = request.getPassword();
        if (password == null || !PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException("Invalid password. Must be 8+ characters, with at least one uppercase, one lowercase, and one number. No special characters allowed.");
        }

        // 3. Check if Username exists
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username is already taken!");
        }

        // 4. Check if Email exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use!");
        }

        // 5. All checks passed, create new user
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(password));

        // --- THIS IS THE FIX ---
        // It was trying to call request.getName(), but the DTO field is fullName
        newUser.setFullName(request.getFullName());

        newUser.setEmail(request.getEmail());
        newUser.setDepartment(request.getDepartment());

        // Validate and normalize role
        String role = request.getRole();
        if ("STUDENT".equalsIgnoreCase(role) || "ROLE_STUDENT".equalsIgnoreCase(role)) {
            newUser.setRole("ROLE_STUDENT");
        } else if ("FACULTY".equalsIgnoreCase(role) || "ROLE_FACULTY".equalsIgnoreCase(role)) {
            newUser.setRole("ROLE_FACULTY");
        } else {
            throw new IllegalArgumentException("Invalid role specified.");
        }

        // 6. Save Security Question
        newUser.setSecurityQuestionIndex(request.getSecurityQuestionIndex());
        if (request.getSecurityAnswer() == null || request.getSecurityAnswer().trim().isEmpty()) {
            throw new IllegalArgumentException("Security answer cannot be empty.");
        }
        // Hash the answer before saving
        newUser.setSecurityAnswerHash(passwordEncoder.encode(request.getSecurityAnswer()));

        // 7. Save user
        userRepository.save(newUser);
    }

    public int getSecurityQuestion(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (user.getSecurityQuestionIndex() == 0) {
            throw new IllegalArgumentException("User has not set up a security question.");
        }
        return user.getSecurityQuestionIndex();
    }

    public boolean verifySecurityAnswer(String username, String answer) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (answer == null || answer.trim().isEmpty()) {
            return false;
        }

        // Use the same password encoder to compare the plain text answer
        // with the stored hash.
        return passwordEncoder.matches(answer, user.getSecurityAnswerHash());
    }

    public void updatePassword(String username, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        // Validate new password strength
        if (newPassword == null || !PASSWORD_PATTERN.matcher(newPassword).matches()) {
            throw new IllegalArgumentException("Invalid new password. Must be 8+ characters, with at least one uppercase, one lowercase, and one number. No special characters allowed.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}

