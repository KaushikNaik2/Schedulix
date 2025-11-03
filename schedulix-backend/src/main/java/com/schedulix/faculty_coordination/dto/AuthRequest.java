package com.schedulix.faculty_coordination.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO (Data Transfer Object) for the /login endpoint.
 * This class is separate from RegisterRequest and only holds login credentials.
 */
@Getter
@Setter
public class AuthRequest {
    private String username;
    private String password;
}
