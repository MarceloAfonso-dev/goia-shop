package com.goiashop.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.goiashop.model.SecurityLog;

@Repository
public interface SecurityLogRepository extends JpaRepository<SecurityLog, Long> {
    
    /**
     * Buscar logs de segurança de um cliente ordenados por data (mais recentes primeiro)
     */
    List<SecurityLog> findByClienteIdOrderByCreatedAtDesc(Long clienteId);
    
    /**
     * Buscar logs de segurança de um cliente por período
     */
    @Query("SELECT s FROM SecurityLog s WHERE s.cliente.id = ?1 AND s.createdAt BETWEEN ?2 AND ?3 ORDER BY s.createdAt DESC")
    List<SecurityLog> findByClienteIdAndPeriod(Long clienteId, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Buscar logs de segurança de um cliente por tipo de ação
     */
    List<SecurityLog> findByClienteIdAndActionOrderByCreatedAtDesc(Long clienteId, String action);
    
    /**
     * Buscar últimos N logs de um cliente
     */
    @Query(value = "SELECT * FROM security_logs WHERE cliente_id = ?1 ORDER BY created_at DESC LIMIT ?2", nativeQuery = true)
    List<SecurityLog> findLastNLogsByClienteId(Long clienteId, int limit);
    
    /**
     * Contar logs por cliente e período
     */
    @Query("SELECT COUNT(s) FROM SecurityLog s WHERE s.cliente.id = ?1 AND s.createdAt BETWEEN ?2 AND ?3")
    Long countByClienteIdAndPeriod(Long clienteId, LocalDateTime startDate, LocalDateTime endDate);
}