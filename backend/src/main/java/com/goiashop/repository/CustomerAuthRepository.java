package com.goiashop.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.goiashop.model.CustomerAuth;

@Repository
public interface CustomerAuthRepository extends JpaRepository<CustomerAuth, Long> {
    
    Optional<CustomerAuth> findByEmail(String email);
    
    boolean existsByEmail(String email);
}
