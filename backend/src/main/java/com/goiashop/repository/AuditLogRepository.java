package com.goiashop.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.goiashop.model.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    /**
     * Busca logs de auditoria por usuário
     */
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Busca logs de auditoria por ação
     */
    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);
    
    /**
     * Busca logs de auditoria por tabela
     */
    List<AuditLog> findByTableNameOrderByCreatedAtDesc(String tableName);
    
    /**
     * Busca logs de auditoria por registro específico
     */
    List<AuditLog> findByTableNameAndRecordIdOrderByCreatedAtDesc(String tableName, Long recordId);
    
    /**
     * Busca logs de auditoria em um período específico
     */
    @Query("SELECT a FROM AuditLog a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    List<AuditLog> findByDateRangeOrderByCreatedAtDesc(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Busca logs de auditoria por usuário e ação
     */
    List<AuditLog> findByUserIdAndActionOrderByCreatedAtDesc(Long userId, String action);
}