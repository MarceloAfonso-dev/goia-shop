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
    
    private static final Map<String, User> activeSessions = new HashMap<>();
    
    public LoginResponse login(LoginRequest request) {
        try {
            Optional<User> userOpt = userRepository.findByEmailAndStatus(
                request.getEmail(), 
                User.UserStatus.ATIVO
            );
            
            if (userOpt.isEmpty()) {
                return new LoginResponse("Usuário não encontrado ou inativo");
            }
            
            User user = userOpt.get();
            
            if (user.getGrupo() == null) {
                return new LoginResponse("Usuário não tem permissão para acessar o backoffice");
            }
            
            if (!passwordService.verifyPassword(request.getSenha(), user.getSenhaHash())) {
                return new LoginResponse("Senha incorreta");
            }
            
            String token = createSession(user);
            return new LoginResponse(token, user);
            
        } catch (Exception e) {
            return new LoginResponse("Erro interno: " + e.getMessage());
        }
    }
    
    private String createSession(User user) {
        String token = UUID.randomUUID().toString();
        activeSessions.put(token, user);
        return token;
    }
    
    public User validateSession(String token) {
        return activeSessions.get(token);
    }
    
    public void logout(String token) {
        activeSessions.remove(token);
    }
    
    public boolean isAdmin(String token) {
        User user = validateSession(token);
        return user != null && user.getGrupo() == User.UserGroup.ADMIN;
    }
    
    public boolean isEstoquista(String token) {
        User user = validateSession(token);
        return user != null && user.getGrupo() == User.UserGroup.ESTOQUISTA;
    }
}
