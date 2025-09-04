package com.goiashop.controller;

import com.goiashop.dto.LoginRequest;
import com.goiashop.dto.LoginResponse;
import com.goiashop.service.AuthService;
import com.goiashop.service.PasswordService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private PasswordService passwordService;
    
    /**
     * Endpoint de login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Endpoint de logout
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            authService.logout(token);
        }
        return ResponseEntity.ok("Logout realizado com sucesso");
    }
    
    /**
     * Endpoint para verificar se o token é válido
     */
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            boolean isValid = authService.validateSession(token) != null;
            return ResponseEntity.ok(isValid);
        }
        return ResponseEntity.ok(false);
    }
    
    /**
     * Endpoint para verificar se o usuário é admin
     */
    @GetMapping("/is-admin")
    public ResponseEntity<Boolean> isAdmin(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            boolean isAdmin = authService.isAdmin(token);
            return ResponseEntity.ok(isAdmin);
        }
        return ResponseEntity.ok(false);
    }
    
}
