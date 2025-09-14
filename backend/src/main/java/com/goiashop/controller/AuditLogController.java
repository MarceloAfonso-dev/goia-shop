package com.goiashop.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.model.AuditLog;
import com.goiashop.service.AuditLogService;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    /**
     * Lista todos os logs de auditoria (com paginação futura)
     */
    @GetMapping
    public ResponseEntity<List<AuditLog>> listarTodos() {
        List<AuditLog> logs = auditLogService.getLogsByDateRange(
            LocalDateTime.now().minusDays(30), // Últimos 30 dias
            LocalDateTime.now()
        );
        return ResponseEntity.ok(logs);
    }

    /**
     * Lista logs por usuário
     */
    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<AuditLog>> listarPorUsuario(@PathVariable Long userId) {
        List<AuditLog> logs = auditLogService.getLogsByUser(userId);
        return ResponseEntity.ok(logs);
    }

    /**
     * Lista logs por tabela
     */
    @GetMapping("/tabela/{tableName}")
    public ResponseEntity<List<AuditLog>> listarPorTabela(@PathVariable String tableName) {
        List<AuditLog> logs = auditLogService.getLogsByTable(tableName);
        return ResponseEntity.ok(logs);
    }

    /**
     * Lista logs por registro específico
     */
    @GetMapping("/registro/{tableName}/{recordId}")
    public ResponseEntity<List<AuditLog>> listarPorRegistro(
            @PathVariable String tableName,
            @PathVariable Long recordId) {
        List<AuditLog> logs = auditLogService.getLogsByRecord(tableName, recordId);
        return ResponseEntity.ok(logs);
    }

    /**
     * Lista logs por período
     */
    @GetMapping("/periodo")
    public ResponseEntity<List<AuditLog>> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        List<AuditLog> logs = auditLogService.getLogsByDateRange(inicio, fim);
        return ResponseEntity.ok(logs);
    }
}