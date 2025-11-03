package com.goiashop.dto;

import java.time.format.DateTimeFormatter;

import com.goiashop.model.SecurityLog;

public class SecurityLogResponse {
    
    private Long id;
    private String action;
    private String description;
    private String status;
    private String ipAddress;
    private String userAgent;
    private String createdAt;
    private String actionDisplay;
    private String statusDisplay;
    
    // Constructors
    public SecurityLogResponse() {}
    
    public SecurityLogResponse(SecurityLog log) {
        this.id = log.getId();
        this.action = log.getAction();
        this.description = log.getDescription();
        this.status = log.getStatus();
        this.ipAddress = log.getIpAddress();
        this.userAgent = log.getUserAgent();
        this.createdAt = log.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        
        // Traduzir ações para português
        this.actionDisplay = traduzirAcao(log.getAction());
        this.statusDisplay = traduzirStatus(log.getStatus());
    }
    
    private String traduzirAcao(String action) {
        switch (action) {
            case "LOGIN":
                return "Login";
            case "LOGOUT":
                return "Logout";
            case "PASSWORD_CHANGE":
                return "Alteração de Senha";
            case "PROFILE_UPDATE":
                return "Atualização de Perfil";
            default:
                return action;
        }
    }
    
    private String traduzirStatus(String status) {
        switch (status) {
            case "SUCCESS":
                return "Sucesso";
            case "FAILED":
                return "Falhou";
            default:
                return status;
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getActionDisplay() {
        return actionDisplay;
    }
    
    public void setActionDisplay(String actionDisplay) {
        this.actionDisplay = actionDisplay;
    }
    
    public String getStatusDisplay() {
        return statusDisplay;
    }
    
    public void setStatusDisplay(String statusDisplay) {
        this.statusDisplay = statusDisplay;
    }
}