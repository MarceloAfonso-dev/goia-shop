package com.goiashop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.service.PasswordService;

@RestController
@RequestMapping("/api/util")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class UtilController {
    
    @Autowired
    private PasswordService passwordService;
    
    @PostMapping("/hash-password")
    public String hashPassword(@RequestBody String password) {
        return passwordService.encryptPassword(password);
    }
}