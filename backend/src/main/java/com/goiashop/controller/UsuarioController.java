package com.goiashop.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.dto.PaginatedResponse;
import com.goiashop.dto.UsuarioAlteracaoRequest;
import com.goiashop.dto.UsuarioCadastroRequest;
import com.goiashop.model.User;
import com.goiashop.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class UsuarioController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> listarUsuarios(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize) {
        
        // Se page foi fornecido, usar paginação
        if (page != null) {
            int size = pageSize != null ? pageSize : 10; // Default 10 itens por página
            PaginatedResponse<User> response = userService.listarComPaginacao(nome, status, page, size);
            return ResponseEntity.ok(response);
        } else {
            // Compatibilidade com versão anterior (sem paginação)
            List<User> usuarios = userService.listarTodos();
            return ResponseEntity.ok(usuarios);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> buscarPorId(@PathVariable Long id) {
        User usuario = userService.buscarPorId(id);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Altera o status de um usuário (ATIVO/INATIVO)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> alterarStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String novoStatus = request.get("status");
            
            if (novoStatus == null || (!novoStatus.equals("ATIVO") && !novoStatus.equals("INATIVO"))) {
                return ResponseEntity.badRequest().body("Status deve ser ATIVO ou INATIVO");
            }
            
            User.UserStatus status = User.UserStatus.valueOf(novoStatus);
            User usuarioAtualizado = userService.alterarStatus(id, status);
            
            if (usuarioAtualizado != null) {
                return ResponseEntity.ok(usuarioAtualizado);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Status inválido");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno: " + e.getMessage());
        }
    }
    
    /**
     * Lista usuários com filtro por status (opcional)
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<User>> listarPorStatus(@PathVariable String status) {
        try {
            User.UserStatus userStatus = User.UserStatus.valueOf(status.toUpperCase());
            List<User> usuarios = userService.listarPorStatus(userStatus);
            return ResponseEntity.ok(usuarios);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Lista usuários com filtro por nome (opcional)
     */
    @GetMapping("/filtrar")
    public ResponseEntity<List<User>> filtrarPorNome(@RequestParam(required = false) String nome) {
        List<User> usuarios;
        if (nome != null && !nome.trim().isEmpty()) {
            usuarios = userService.filtrarPorNome(nome.trim());
        } else {
            usuarios = userService.listarTodos();
        }
        return ResponseEntity.ok(usuarios);
    }
    
    /**
     * Cadastra um novo usuário
     */
    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrarUsuario(@Valid @RequestBody UsuarioCadastroRequest request) {
        try {
            // Validação de senhas coincidentes
            if (!request.getSenha().equals(request.getConfirmaSenha())) {
                return ResponseEntity.badRequest().body("As senhas não coincidem");
            }
            
            // Verificar se CPF já existe
            if (userService.existeByCpf(request.getCpf())) {
                return ResponseEntity.badRequest().body("CPF já cadastrado no sistema");
            }
            
            // Verificar se email já existe
            if (userService.existeByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body("Email já cadastrado no sistema");
            }
            
            User novoUsuario = userService.cadastrarUsuario(request);
            return ResponseEntity.ok(novoUsuario);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno: " + e.getMessage());
        }
    }
    
    /**
     * Altera dados de um usuário existente
     */
    @PutMapping("/{id}/alterar")
    public ResponseEntity<?> alterarUsuario(@PathVariable Long id, @RequestBody UsuarioAlteracaoRequest request) {
        try {
            // Buscar usuário existente
            User usuarioExistente = userService.buscarPorId(id);
            if (usuarioExistente == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Validações básicas
            if (request.getNome() != null && request.getNome().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nome não pode ser vazio");
            }
            
            if (request.getCpf() != null && !request.getCpf().matches("\\d{11}")) {
                return ResponseEntity.badRequest().body("CPF deve conter exatamente 11 dígitos");
            }
            
            // Se alterando senha, validar
            if (request.getSenha() != null && !request.getSenha().isEmpty()) {
                if (request.getSenha().length() < 6) {
                    return ResponseEntity.badRequest().body("Senha deve ter no mínimo 6 caracteres");
                }
                if (!request.getSenha().equals(request.getConfirmaSenha())) {
                    return ResponseEntity.badRequest().body("As senhas não coincidem");
                }
            }
            
            if (request.getGrupo() != null && (!request.getGrupo().equals("ADMIN") && !request.getGrupo().equals("ESTOQUISTA"))) {
                return ResponseEntity.badRequest().body("Grupo deve ser ADMIN ou ESTOQUISTA");
            }
            
            // Verificar se CPF já existe (exceto para o próprio usuário)
            if (request.getCpf() != null && !request.getCpf().equals(usuarioExistente.getCpf())) {
                if (userService.existeByCpf(request.getCpf())) {
                    return ResponseEntity.badRequest().body("CPF já cadastrado no sistema");
                }
            }
            
            User usuarioAtualizado = userService.alterarUsuario(id, request);
            return ResponseEntity.ok(usuarioAtualizado);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno: " + e.getMessage());
        }
    }
}
