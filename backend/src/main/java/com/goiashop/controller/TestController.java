package com.goiashop.controller;

import com.goiashop.service.PasswordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class TestController {

    @Autowired
    private PasswordService passwordService;

    @PostMapping("/password")
    public Map<String, Object> testPassword(@RequestBody Map<String, String> request) {
        String plainPassword = request.get("password");
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Aplica BCrypt diretamente na senha em texto puro
            String bcryptHash = passwordService.encryptPassword(plainPassword);
            
            // Testa validação
            boolean isValid = passwordService.verifyPassword(plainPassword, bcryptHash);
            
            result.put("plainPassword", plainPassword);
            result.put("bcryptHash", bcryptHash);
            result.put("isValid", isValid);
            result.put("success", true);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    @PostMapping("/validate")
    public Map<String, Object> validatePassword(@RequestBody Map<String, String> request) {
        String plainPassword = request.get("password");
        String storedHash = request.get("storedHash");
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Valida senha em texto puro com hash BCrypt armazenado
            boolean isValid = passwordService.verifyPassword(plainPassword, storedHash);
            
            result.put("plainPassword", plainPassword);
            result.put("storedHash", storedHash);
            result.put("isValid", isValid);
            result.put("success", true);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
}
