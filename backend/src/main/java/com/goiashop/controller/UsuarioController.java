package com.goiashop.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.model.User;
import com.goiashop.service.UserService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class UsuarioController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> listarUsuarios() {
        List<User> usuarios = userService.listarTodos();
        return ResponseEntity.ok(usuarios);
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
}
