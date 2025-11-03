package com.schedulix.faculty_coordination.dto;

import lombok.Getter;
import lombok.Setter;

// This replaces the old AuthRequest for registration purposes
@Getter
@Setter
public class RegisterRequest {
    // Basic auth
    private String username;
    private String password;
    private String role;

    // NEW FIELDS
    private String fullName;
    private String department;
    private String email;

    // Security Question fields
    private Integer securityQuestionIndex;
    private String securityAnswer;
}
