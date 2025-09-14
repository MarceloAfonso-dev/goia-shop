package com.goiashop.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {
    
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    
    public PasswordService() {
        this.bCryptPasswordEncoder = new BCryptPasswordEncoder();
    }
    
    public String encryptPassword(String plainPassword) {
        return bCryptPasswordEncoder.encode(plainPassword);
    }
    
    public boolean verifyPassword(String plainPassword, String bcryptFromDatabase) {
        return bCryptPasswordEncoder.matches(plainPassword, bcryptFromDatabase);
    }
}
