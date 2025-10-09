package com.goiashop.service;

import com.goiashop.model.Cliente;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class ClienteSessionService {
    
    private final Map<String, Long> activeSessions = new ConcurrentHashMap<>();
    private final Map<String, Long> sessionTimestamps = new ConcurrentHashMap<>();
    
    // Sessão válida por 24 horas
    private static final long SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    
    public String createSession(Cliente cliente) {
        String token = UUID.randomUUID().toString();
        activeSessions.put(token, cliente.getId());
        sessionTimestamps.put(token, System.currentTimeMillis());
        return token;
    }
    
    public Long validateSession(String token) {
        if (token == null) return null;
        
        Long clienteId = activeSessions.get(token);
        if (clienteId == null) return null;
        
        Long timestamp = sessionTimestamps.get(token);
        if (timestamp == null) return null;
        
        // Verificar se a sessão expirou
        if (System.currentTimeMillis() - timestamp > SESSION_TIMEOUT) {
            removeSession(token);
            return null;
        }
        
        // Atualizar timestamp da sessão
        sessionTimestamps.put(token, System.currentTimeMillis());
        
        return clienteId;
    }
    
    public void removeSession(String token) {
        activeSessions.remove(token);
        sessionTimestamps.remove(token);
    }
    
    public void removeAllSessionsForCliente(Long clienteId) {
        activeSessions.entrySet().removeIf(entry -> entry.getValue().equals(clienteId));
        // Limpar timestamps órfãos
        sessionTimestamps.entrySet().removeIf(entry -> !activeSessions.containsKey(entry.getKey()));
    }
}
