package com.goiashop.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.goiashop.dto.PaginatedResponse;
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
    
    @Autowired
    private AuditLogService auditLogService;

    public List<User> listarTodos() {
        return userRepository.findAll();
    }
    
    /**
     * Lista usuários com paginação e filtros
     */
    public PaginatedResponse<User> listarComPaginacao(String nome, String status, int page, int size) {
        // Configurar ordenação por nome
        Pageable pageable = PageRequest.of(page, size, Sort.by("nome").ascending());
        
        User.UserStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                statusEnum = User.UserStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignora status inválido
            }
        }
        
        Page<User> userPage = userRepository.findByFilters(nome, statusEnum, pageable);
        
        return new PaginatedResponse<>(
            userPage.getContent(),
            userPage.getNumber(),
            userPage.getSize(),
            userPage.getTotalElements()
        );
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
        User.UserStatus statusAntigo = user.getStatus();
        user.setStatus(novoStatus);
        user.setUpdatedAt(LocalDateTime.now());

        User usuarioAtualizado = userRepository.save(user);
        
        // Registra auditoria de mudança de status
        auditLogService.logStatusChange(1L, "users", usuarioAtualizado.getId(), 
                                       statusAntigo.toString(), novoStatus.toString());

        return usuarioAtualizado;
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
        
        User usuarioSalvo = userRepository.save(novoUsuario);
        
        // Registra auditoria de criação
        auditLogService.logCreate(1L, "users", usuarioSalvo.getId(), usuarioSalvo);
        
        return usuarioSalvo;
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
        
        User usuarioAtualizado = userRepository.save(usuario);
        
        // Registra auditoria de atualização
        auditLogService.logUpdate(1L, "users", usuarioAtualizado.getId(), userOpt.get(), usuarioAtualizado);
        
        return usuarioAtualizado;
    }
}