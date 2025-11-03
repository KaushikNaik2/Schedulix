package com.schedulix.faculty_coordination.controller;

import com.schedulix.faculty_coordination.dto.*; // Import all DTOs
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.security.JwtUtil;
import com.schedulix.faculty_coordination.service.AuthService; // Import the new service

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthService authService; // Use the service for logic

    /**
     * Registers a new user.
     * All validation is handled by AuthService.
     */
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegisterRequest registerRequest) {
        // The service handles all validation (username, password, existing user)
        // and throws IllegalArgumentException if invalid.
        authService.registerUser(registerRequest);
        return ResponseEntity.ok("User registered successfully!");
    }

    /**
     * Authenticates a user and returns a JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginAndGetToken(@RequestBody AuthRequest authRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );

            if (authentication.isAuthenticated()) {
                // We cast to our User model to get the role
                User userDetails = (User) authentication.getPrincipal();
                String role = userDetails.getRole();

                String token = jwtUtil.generateToken(authRequest.getUsername(), role);
                return ResponseEntity.ok(new AuthResponse(token));
            } else {
                throw new UsernameNotFoundException("Invalid credentials");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    // --- FORGOT PASSWORD FLOW ---

    /**
     * Step 1: Start Forgot Password process.
     * Takes a username and returns the user's security question index.
     */
    @PostMapping("/forgot/start")
    public ResponseEntity<?> startPasswordReset(@RequestBody ForgotUsernameRequest request) {
        int questionIndex = authService.getSecurityQuestion(request.getUsername());
        // Return a JSON object: {"securityQuestionIndex": 1}
        return ResponseEntity.ok(Map.of("securityQuestionIndex", questionIndex));
    }

    /**
     * Step 2: Verify Security Question Answer.
     * Takes username and answer, returns success if they match.
     */
    @PostMapping("/forgot/verify")
    public ResponseEntity<String> verifySecurityAnswer(@RequestBody SecurityAnswerRequest request) {
        boolean isCorrect = authService.verifySecurityAnswer(request.getUsername(), request.getAnswer());
        if (isCorrect) {
            return ResponseEntity.ok("Verification successful. You can now reset your password.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Incorrect answer.");
        }
    }

    /**
     * Step 3: Update Password.
     * Takes username and newPassword, validates password strength, and updates.
     */
    @PostMapping("/forgot/update")
    public ResponseEntity<String> updatePassword(@RequestBody PasswordUpdateRequest request) {
        // The service validates the new password's strength
        authService.updatePassword(request.getUsername(), request.getNewPassword());
        return ResponseEntity.ok("Password updated successfully. Please log in.");
    }


    /**
     * Global Exception Handler for this Controller.
     * Catches validation errors from AuthService and returns them as 400 Bad Request.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleValidationException(IllegalArgumentException ex) {
        // This returns the specific error message (e.g., "Invalid username format...")
        // to the React frontend.
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

} // <-- THIS WAS THE MISSING BRACE

