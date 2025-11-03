package com.goiashop.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.goiashop.model.Cliente;
import com.goiashop.model.SecurityLog;
import com.goiashop.repository.SecurityLogRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class SecurityLogService {
    
    @Autowired
    private SecurityLogRepository securityLogRepository;
    
    /**
     * Registrar um log de segurança
     */
    public SecurityLog registrarLog(Cliente cliente, String action, String description, String status) {
        SecurityLog log = new SecurityLog(cliente, action, description, status);
        return securityLogRepository.save(log);
    }
    
    /**
     * Registrar um log de segurança com informações da requisição
     */
    public SecurityLog registrarLog(Cliente cliente, String action, String description, String status, HttpServletRequest request) {
        String ipAddress = getClientIP(request);
        String userAgent = request.getHeader("User-Agent");
        
        SecurityLog log = new SecurityLog(cliente, action, description, status, ipAddress, userAgent);
        return securityLogRepository.save(log);
    }
    
    /**
     * Buscar histórico de segurança de um cliente
     */
    public List<SecurityLog> buscarHistoricoCliente(Long clienteId) {
        return securityLogRepository.findByClienteIdOrderByCreatedAtDesc(clienteId);
    }
    
    /**
     * Buscar últimos logs de um cliente (limitado)
     */
    public List<SecurityLog> buscarUltimosLogs(Long clienteId, int limit) {
        return securityLogRepository.findLastNLogsByClienteId(clienteId, limit);
    }
    
    /**
     * Buscar logs por período
     */
    public List<SecurityLog> buscarLogsPorPeriodo(Long clienteId, LocalDateTime inicio, LocalDateTime fim) {
        return securityLogRepository.findByClienteIdAndPeriod(clienteId, inicio, fim);
    }
    
    /**
     * Registrar login bem-sucedido
     */
    public void registrarLogin(Cliente cliente, HttpServletRequest request) {
        registrarLog(cliente, "LOGIN", "Login realizado com sucesso", "SUCCESS", request);
    }
    
    /**
     * Registrar tentativa de login falhada
     */
    public void registrarLoginFailed(Cliente cliente, HttpServletRequest request) {
        registrarLog(cliente, "LOGIN", "Tentativa de login com credenciais inválidas", "FAILED", request);
    }
    
    /**
     * Registrar logout
     */
    public void registrarLogout(Cliente cliente, HttpServletRequest request) {
        registrarLog(cliente, "LOGOUT", "Logout realizado", "SUCCESS", request);
    }
    
    /**
     * Registrar alteração de senha
     */
    public void registrarAlteracaoSenha(Cliente cliente, HttpServletRequest request) {
        registrarLog(cliente, "PASSWORD_CHANGE", "Senha alterada com sucesso", "SUCCESS", request);
    }
    
    /**
     * Registrar tentativa de alteração de senha falhada
     */
    public void registrarAlteracaoSenhaFailed(Cliente cliente, String motivo, HttpServletRequest request) {
        registrarLog(cliente, "PASSWORD_CHANGE", "Falha na alteração de senha: " + motivo, "FAILED", request);
    }
    
    /**
     * Registrar atualização de perfil
     */
    public void registrarAtualizacaoPerfil(Cliente cliente, HttpServletRequest request) {
        registrarLog(cliente, "PROFILE_UPDATE", "Perfil atualizado com sucesso", "SUCCESS", request);
    }
    
    /**
     * Obter IP do cliente considerando proxies
     */
    private String getClientIP(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null || xForwardedForHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xForwardedForHeader.split(",")[0].trim();
    }
}