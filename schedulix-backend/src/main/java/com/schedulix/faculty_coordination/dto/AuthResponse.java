package com.schedulix.faculty_coordination.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

// Yeh class login ke baad token waapis bhejne ke liye istemal hogi
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
}
