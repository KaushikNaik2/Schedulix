package com.schedulix.faculty_coordination.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // e.g., "ROLE_STUDENT", "ROLE_FACULTY"

    @Column(unique = true)
    private String email;

    private String department;

    // --- Fields for Forgot Password ---
    private int securityQuestionIndex;
    private String securityAnswerHash;

    // --- NEW FIELDS TO FIX BUILD ERRORS ---

    @Column(name = "full_name") // This field is used by RegisterRequest
    private String fullName;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "subjects") // For faculty
    private String subjects; // e.g., "DSA, OS, DBMS"

    @Column(name = "office_location") // For faculty
    private String officeLocation; // e.g., "Cabin C-5"


    // --- Spring Security UserDetails Methods ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority(this.role));
    }

    // We override getPassword() to ensure it satisfies the UserDetails interface
    // (This is required by Spring Security)
    @Override
    public String getPassword() {
        return this.password;
    }

    // We override getUsername() to ensure it satisfies the UserDetails interface
    // (This is required by Spring Security)
    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
