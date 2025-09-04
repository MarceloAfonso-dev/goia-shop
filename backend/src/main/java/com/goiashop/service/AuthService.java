package com.goiashop.service;

import com.goiashop.dto.LoginRequest;
import com.goiashop.dto.LoginResponse;
import com.goiashop.model.User;
import com.goiashop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordService passwordService;
    
    // Simulação de sessões em memória (em produção usar Redis ou JWT)
    private static final Map<String, User> activeSessions = new HashMap<>();
    
    /**
     * Realiza o login do usuário
     */
    public LoginResponse login(LoginRequest request) {
        try {
            // Busca usuário por email e status ativo
            Optional<User> userOpt = userRepository.findByEmailAndStatus(
                request.getEmail(), 
                User.UserStatus.ATIVO
            );
            
            if (userOpt.isEmpty()) {
                return new LoginResponse("Usuário não encontrado ou inativo");
            }
            
            User user = userOpt.get();
            
            // Verifica se é usuário de backoffice (não CLIENTE)
            if (user.getGrupo() == null) {
                return new LoginResponse("Usuário não tem permissão para acessar o backoffice");
            }
            
            // Valida senha usando SHA-256 + BCrypt
            if (!validatePassword(request.getSenha(), user.getSenhaHash())) {
                return new LoginResponse("Senha incorreta");
            }
            
            // Cria sessão
            String token = createSession(user);
            
            return new LoginResponse(token, user);
            
        } catch (Exception e) {
            return new LoginResponse("Erro interno: " + e.getMessage());
        }
    }
    
    /**
     * Valida senha recebida do frontend (já em SHA-256) com hash BCrypt do banco
     */
    private boolean validatePassword(String sha256FromFrontend, String bcryptFromDatabase) {
        // O frontend deve enviar a senha já em SHA-256
        // Aqui comparamos o SHA-256 com o BCrypt armazenado
        return passwordService.verifyPassword(sha256FromFrontend, bcryptFromDatabase);
    }
    
    /**
     * Cria uma nova sessão para o usuário
     */
    private String createSession(User user) {
        String token = UUID.randomUUID().toString();
        activeSessions.put(token, user);
        return token;
    }
    
    /**
     * Valida se o token é válido
     */
    public User validateSession(String token) {
        return activeSessions.get(token);
    }
    
    /**
     * Remove a sessão (logout)
     */
    public void logout(String token) {
        activeSessions.remove(token);
    }
    
    /**
     * Verifica se o usuário tem permissão de admin
     */
    public boolean isAdmin(String token) {
        User user = validateSession(token);
        return user != null && user.getGrupo() == User.UserGroup.ADMIN;
    }
    
    /**
     * Verifica se o usuário tem permissão de estoquista
     */
    public boolean isEstoquista(String token) {
        User user = validateSession(token);
        return user != null && user.getGrupo() == User.UserGroup.ESTOQUISTA;
    }
}
