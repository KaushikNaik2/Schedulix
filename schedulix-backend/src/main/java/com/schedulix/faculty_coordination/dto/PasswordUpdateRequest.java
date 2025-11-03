package com.schedulix.faculty_coordination.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordUpdateRequest {
    private String username;
    private String newPassword;
}
