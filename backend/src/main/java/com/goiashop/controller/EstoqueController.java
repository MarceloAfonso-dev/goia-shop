package com.goiashop.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.model.Pedido;
import com.goiashop.service.AuthService;
import com.goiashop.service.PedidoService;

/**
 * Controller para funcionalidades específicas do Estoquista
 * S6: Visualizar lista de pedidos e status
 */
@RestController
@RequestMapping("/api/estoque")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class EstoqueController {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private AuthService authService;

    /**
     * Lista todos os pedidos para o estoquista
     * GET /api/estoque/pedidos
     */
    @GetMapping("/pedidos")
    public ResponseEntity<?> listarPedidos(
            @RequestHeader("Authorization") String authorization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validar token
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("message", "Token de autorização necessário");
                return ResponseEntity.status(401).body(response);
            }
            
            String token = authorization.substring(7);
            var user = authService.validateSession(token);
            
            if (user == null) {
                response.put("success", false);
                response.put("message", "Sessão inválida");
                return ResponseEntity.status(401).body(response);
            }
            
            // Verificar se é estoquista ou admin
            if (!authService.isEstoquista(token) && !authService.isAdmin(token)) {
                response.put("success", false);
                response.put("message", "Acesso negado. Apenas estoquistas e administradores podem visualizar pedidos");
                return ResponseEntity.status(403).body(response);
            }
            
            // Buscar pedidos com paginação
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Pedido> pedidosPage = pedidoService.listarTodosPedidosComPaginacao(pageable);
            
            // Montar resposta
            response.put("success", true);
            response.put("pedidos", pedidosPage.getContent());
            response.put("page", pedidosPage.getNumber());
            response.put("size", pedidosPage.getSize());
            response.put("totalElements", pedidosPage.getTotalElements());
            response.put("totalPages", pedidosPage.getTotalPages());
            response.put("first", pedidosPage.isFirst());
            response.put("last", pedidosPage.isLast());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Erro interno: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Atualiza status do pedido (funcionalidade futura)
     * PUT /api/estoque/pedidos/{id}/status
     */
    @PutMapping("/pedidos/{id}/status")
    public ResponseEntity<?> atualizarStatusPedido(
            @PathVariable Long id,
            @RequestBody Map<String, Object> requestBody,
            @RequestHeader("Authorization") String authorization) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validar token
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("message", "Token de autorização necessário");
                return ResponseEntity.status(401).body(response);
            }
            
            String token = authorization.substring(7);
            var user = authService.validateSession(token);
            
            if (user == null) {
                response.put("success", false);
                response.put("message", "Sessão inválida");
                return ResponseEntity.status(401).body(response);
            }
            
            // Verificar se é estoquista ou admin
            if (!authService.isEstoquista(token) && !authService.isAdmin(token)) {
                response.put("success", false);
                response.put("message", "Acesso negado");
                return ResponseEntity.status(403).body(response);
            }
            
            String novoStatus = (String) requestBody.get("status");
            String motivo = (String) requestBody.get("motivo");
            
            if (novoStatus == null || novoStatus.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Status é obrigatório");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Validar status permitidos
            String[] statusPermitidos = {"PENDENTE", "CONFIRMADO", "PREPARANDO", "ENVIADO", "ENTREGUE", "CANCELADO"};
            boolean statusValido = java.util.Arrays.asList(statusPermitidos).contains(novoStatus.toUpperCase());
            
            if (!statusValido) {
                response.put("success", false);
                response.put("message", "Status inválido. Valores permitidos: " + String.join(", ", statusPermitidos));
                return ResponseEntity.badRequest().body(response);
            }
            
            // Atualizar status
            Pedido.PedidoStatus statusEnum;
            try {
                statusEnum = Pedido.PedidoStatus.valueOf(novoStatus.toUpperCase());
            } catch (IllegalArgumentException e) {
                response.put("success", false);
                response.put("message", "Erro ao processar status: " + novoStatus);
                return ResponseEntity.badRequest().body(response);
            }
            
            Pedido pedidoAtualizado = pedidoService.atualizarStatus(id, statusEnum);
            
            response.put("success", true);
            response.put("message", "Status do pedido atualizado com sucesso");
            response.put("pedido", pedidoAtualizado);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Erro interno: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}