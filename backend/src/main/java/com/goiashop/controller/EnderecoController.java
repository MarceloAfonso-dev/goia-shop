package com.goiashop.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.model.EnderecoEntrega;
import com.goiashop.service.ClienteSessionService;
import com.goiashop.service.EnderecoEntregaService;

@RestController
@RequestMapping("/api/enderecos")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class EnderecoController {
    
    @Autowired
    private EnderecoEntregaService enderecoService;
    
    @Autowired
    private ClienteSessionService clienteSessionService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> listarEnderecos(
            @RequestHeader("Authorization") String authorization) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validar sessão do cliente
            Long clienteId = validateClienteSession(authorization);
            if (clienteId == null) {
                response.put("success", false);
                response.put("message", "Sessão inválida");
                return ResponseEntity.status(401).body(response);
            }
            
            // Buscar endereços do cliente
            List<EnderecoEntrega> enderecos = enderecoService.listarEnderecosPorCliente(clienteId);
            
            response.put("success", true);
            response.put("enderecos", enderecos);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    private Long validateClienteSession(String authorization) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return null;
            }
            
            String token = authorization.substring(7);
            return clienteSessionService.validateSession(token);
        } catch (Exception e) {
            return null;
        }
    }
}