package com.goiashop.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.goiashop.model.AuditLog;
import com.goiashop.repository.AuditLogRepository;

@Service
public class AuditLogService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    private final ObjectMapper objectMapper;
    
    public AuditLogService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }
    
    /**
     * Registra um log de auditoria para criação de registro
     */
    public void logCreate(Long userId, String tableName, Long recordId, Object newData) {
        try {
            Map<String, Object> changes = new HashMap<>();
            changes.put("action", "CREATE");
            changes.put("new_data", newData);
            
            String changesJson = objectMapper.writeValueAsString(changes);
            
            AuditLog auditLog = new AuditLog(userId, "CREATE", tableName, recordId, changesJson);
            auditLogRepository.save(auditLog);
            
        } catch (JsonProcessingException e) {
            // Log error but don't fail the main operation
            System.err.println("Erro ao serializar dados para auditoria: " + e.getMessage());
        }
    }
    
    /**
     * Registra um log de auditoria para atualização de registro
     */
    public void logUpdate(Long userId, String tableName, Long recordId, Object oldData, Object newData) {
        try {
            Map<String, Object> changes = new HashMap<>();
            changes.put("action", "UPDATE");
            changes.put("old_data", oldData);
            changes.put("new_data", newData);
            
            String changesJson = objectMapper.writeValueAsString(changes);
            
            AuditLog auditLog = new AuditLog(userId, "UPDATE", tableName, recordId, changesJson);
            auditLogRepository.save(auditLog);
            
        } catch (JsonProcessingException e) {
            System.err.println("Erro ao serializar dados para auditoria: " + e.getMessage());
        }
    }
    
    /**
     * Registra um log de auditoria para exclusão de registro
     */
    public void logDelete(Long userId, String tableName, Long recordId, Object deletedData) {
        try {
            Map<String, Object> changes = new HashMap<>();
            changes.put("action", "DELETE");
            changes.put("deleted_data", deletedData);
            
            String changesJson = objectMapper.writeValueAsString(changes);
            
            AuditLog auditLog = new AuditLog(userId, "DELETE", tableName, recordId, changesJson);
            auditLogRepository.save(auditLog);
            
        } catch (JsonProcessingException e) {
            System.err.println("Erro ao serializar dados para auditoria: " + e.getMessage());
        }
    }
    
    /**
     * Registra um log de auditoria para mudança de status
     */
    public void logStatusChange(Long userId, String tableName, Long recordId, String oldStatus, String newStatus) {
        try {
            Map<String, Object> changes = new HashMap<>();
            changes.put("action", "STATUS_CHANGE");
            changes.put("old_status", oldStatus);
            changes.put("new_status", newStatus);
            
            String changesJson = objectMapper.writeValueAsString(changes);
            
            AuditLog auditLog = new AuditLog(userId, "STATUS_CHANGE", tableName, recordId, changesJson);
            auditLogRepository.save(auditLog);
            
        } catch (JsonProcessingException e) {
            System.err.println("Erro ao serializar dados para auditoria: " + e.getMessage());
        }
    }
    
    /**
     * Busca logs de auditoria por usuário
     */
    public List<AuditLog> getLogsByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Busca logs de auditoria por tabela
     */
    public List<AuditLog> getLogsByTable(String tableName) {
        return auditLogRepository.findByTableNameOrderByCreatedAtDesc(tableName);
    }
    
    /**
     * Busca logs de auditoria por registro específico
     */
    public List<AuditLog> getLogsByRecord(String tableName, Long recordId) {
        return auditLogRepository.findByTableNameAndRecordIdOrderByCreatedAtDesc(tableName, recordId);
    }
    
    /**
     * Busca logs de auditoria em um período
     */
    public List<AuditLog> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByDateRangeOrderByCreatedAtDesc(startDate, endDate);
    }
}