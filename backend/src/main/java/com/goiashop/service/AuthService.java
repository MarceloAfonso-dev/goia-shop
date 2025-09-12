package com.goiashop.service;

import com.goiashop.dto.LoginRequest;
import com.goiashop.dto.LoginResponse;
import com.goiashop.model.User;
import com.goiashop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordService passwordService;
    
    @Autowired
    private JwtService jwtService;
    
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
            
            String token = jwtService.generateToken(user);
            return new LoginResponse(token, user);
            
        } catch (Exception e) {
            return new LoginResponse("Erro interno: " + e.getMessage());
        }
    }
    
    public User validateSession(String token) {
        try {
            if (token == null || !jwtService.validateToken(token)) {
                return null;
            }
            
            String email = jwtService.extractEmail(token);
            Optional<User> userOpt = userRepository.findByEmailAndStatus(email, User.UserStatus.ATIVO);
            
            return userOpt.orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
    
    public boolean isAdmin(String token) {
        try {
            return jwtService.validateToken(token) && 
                   "ADMIN".equals(jwtService.extractUserGroup(token));
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean isEstoquista(String token) {
        try {
            return jwtService.validateToken(token) && 
                   ("ESTOQUISTA".equals(jwtService.extractUserGroup(token)) || 
                    "ADMIN".equals(jwtService.extractUserGroup(token)));
        } catch (Exception e) {
            return false;
        }
    }
}
