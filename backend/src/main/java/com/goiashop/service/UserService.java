package com.goiashop.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.goiashop.dto.UsuarioAlteracaoRequest;
import com.goiashop.dto.UsuarioCadastroRequest;
import com.goiashop.model.User;
import com.goiashop.repository.UserRepository;

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
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
    
    /**
     * Filtra usuários por nome (busca parcial)
     */
    public List<User> filtrarPorNome(String nome) {
        return userRepository.findByNomeContainingIgnoreCase(nome);
    }
    
    /**
     * Verifica se já existe usuário com o CPF
     */
    public boolean existeByCpf(String cpf) {
        return userRepository.existsByCpf(cpf);
    }
    
    /**
     * Verifica se já existe usuário com o email
     */
    public boolean existeByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    /**
     * Cadastra um novo usuário
     */
    public User cadastrarUsuario(UsuarioCadastroRequest request) {
        User novoUsuario = new User();
        novoUsuario.setNome(request.getNome());
        novoUsuario.setCpf(request.getCpf());
        novoUsuario.setEmail(request.getEmail());
        novoUsuario.setGrupo(User.UserGroup.valueOf(request.getGrupo()));
        novoUsuario.setStatus(User.UserStatus.ATIVO); // Sempre ativo no cadastro
        novoUsuario.setCreatedAt(LocalDateTime.now());
        novoUsuario.setUpdatedAt(LocalDateTime.now());
        
        // Criptografa a senha
        String senhaHasheada = passwordService.encryptPassword(request.getSenha());
        novoUsuario.setSenhaHash(senhaHasheada);
        
        return userRepository.save(novoUsuario);
    }
    
    /**
     * Altera dados de um usuário existente
     */
    public User alterarUsuario(Long userId, UsuarioAlteracaoRequest request) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Usuário não encontrado");
        }
        
        User usuario = userOpt.get();
        
        // Atualiza apenas os campos fornecidos (não nulos)
        if (request.getNome() != null && !request.getNome().trim().isEmpty()) {
            usuario.setNome(request.getNome());
        }
        
        if (request.getCpf() != null && !request.getCpf().trim().isEmpty()) {
            usuario.setCpf(request.getCpf());
        }
        
        if (request.getGrupo() != null) {
            usuario.setGrupo(User.UserGroup.valueOf(request.getGrupo()));
        }
        
        // Se alterando senha
        if (request.getSenha() != null && !request.getSenha().isEmpty()) {
            String senhaHasheada = passwordService.encryptPassword(request.getSenha());
            usuario.setSenhaHash(senhaHasheada);
        }
        
        usuario.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(usuario);
    }
}