package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // Import List
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    // --- NEW METHOD ---
    // Finds all users with a given role (e.g., "ROLE_FACULTY")
    List<User> findByRole(String role);
    Optional<User> findByEmail(String email);
}