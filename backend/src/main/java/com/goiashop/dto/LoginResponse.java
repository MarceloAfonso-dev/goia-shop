package com.goiashop.dto;

import com.goiashop.model.User;

public class LoginResponse {
    
    private String token;
    private User user;
    private String message;
    private boolean success;
    
    // Default constructor
    public LoginResponse() {}
    
    // Constructor for success
    public LoginResponse(String token, User user) {
        this.token = token;
        this.user = user;
        this.success = true;
        this.message = "Login realizado com sucesso";
    }
    
    // Constructor for error
    public LoginResponse(String message) {
        this.success = false;
        this.message = message;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
}
