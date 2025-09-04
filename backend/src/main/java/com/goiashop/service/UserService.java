package com.goiashop.service;

import com.goiashop.model.User;
import com.goiashop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordService passwordService;

    public List<User> listarTodos() {
        return userRepository.findAll();
    }

    public User buscarPorId(Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.orElse(null);
    }

    public List<User> listarPorGrupo(User.UserGroup grupo) {
        return userRepository.findByGrupo(grupo);
    }

    public List<User> listarPorStatus(User.UserStatus status) {
        return userRepository.findByStatus(status);
    }
    
    /**
     * Cria um novo usuário com senha criptografada
     */
    public User criarUsuario(User user, String senhaPlana) {
        // Criptografa a senha (SHA-256 + BCrypt)
        String senhaHasheada = passwordService.encryptPassword(senhaPlana);
        user.setSenhaHash(senhaHasheada);
        
        return userRepository.save(user);
    }
    
    /**
     * Atualiza senha do usuário
     */
    public User atualizarSenha(Long userId, String novaSenhaPlana) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Usuário não encontrado");
        }
        
        User user = userOpt.get();
        String senhaHasheada = passwordService.encryptPassword(novaSenhaPlana);
        user.setSenhaHash(senhaHasheada);
        
        return userRepository.save(user);
    }
    
    /**
     * Atualiza usuário (sem alterar senha)
     */
    public User atualizarUsuario(User user) {
        return userRepository.save(user);
    }
    
    /**
     * Ativa/Desativa usuário
     */
    public User alterarStatus(Long userId, User.UserStatus novoStatus) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Usuário não encontrado");
        }
        
        User user = userOpt.get();
        user.setStatus(novoStatus);
        
        return userRepository.save(user);
    }
}
