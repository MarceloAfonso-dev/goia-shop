package com.goiashop.controller;

import com.goiashop.dto.CartItemRequest;
import com.goiashop.dto.PedidoRequest;
import com.goiashop.model.Pedido;
import com.goiashop.service.ClienteSessionService;
import com.goiashop.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class PedidoController {
    
    @Autowired
    private PedidoService pedidoService;
    
    @Autowired
    private ClienteSessionService clienteSessionService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> criarPedido(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody Map<String, Object> requestBody) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validar sessão do cliente
            Long clienteId = validateClienteSession(authorization);
            if (clienteId == null) {
                response.put("success", false);
                response.put("message", "Sessão inválida");
                return ResponseEntity.status(401).body(response);
            }
            
            // Extrair dados do request
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itensData = (List<Map<String, Object>>) requestBody.get("itens");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> dadosPedidoData = (Map<String, Object>) requestBody.get("dadosPedido");
            
            // Converter itens
            List<CartItemRequest> itensCarrinho = itensData.stream()
                .map(item -> {
                    CartItemRequest cartItem = new CartItemRequest();
                    cartItem.setProdutoId(Long.valueOf(item.get("produtoId").toString()));
                    cartItem.setQuantidade(Integer.valueOf(item.get("quantidade").toString()));
                    return cartItem;
                })
                .toList();
            
            // Converter dados do pedido
            PedidoRequest dadosPedido = new PedidoRequest();
            dadosPedido.setObservacoes((String) dadosPedidoData.get("observacoes"));
            dadosPedido.setFormaPagamento((String) dadosPedidoData.get("formaPagamento"));
            dadosPedido.setCep((String) dadosPedidoData.get("cep"));
            dadosPedido.setLogradouro((String) dadosPedidoData.get("logradouro"));
            dadosPedido.setNumero((String) dadosPedidoData.get("numero"));
            dadosPedido.setComplemento((String) dadosPedidoData.get("complemento"));
            dadosPedido.setBairro((String) dadosPedidoData.get("bairro"));
            dadosPedido.setCidade((String) dadosPedidoData.get("cidade"));
            dadosPedido.setEstado((String) dadosPedidoData.get("estado"));
            
            // Criar pedido
            Pedido pedido = pedidoService.criarPedido(clienteId, itensCarrinho, dadosPedido);
            
            response.put("success", true);
            response.put("message", "Pedido criado com sucesso");
            response.put("pedido", Map.of(
                "id", pedido.getId(),
                "numeroPedido", pedido.getNumeroPedido(),
                "status", pedido.getStatus().toString(),
                "valorTotal", pedido.getValorTotal()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Pedido>> listarPedidosCliente(@RequestHeader("Authorization") String authorization) {
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<Pedido> pedidos = pedidoService.listarPedidosCliente(clienteId);
        return ResponseEntity.ok(pedidos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPedido(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorization) {
        
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            Pedido pedido = pedidoService.buscarPedido(id, clienteId);
            return ResponseEntity.ok(pedido);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Map<String, Object>> cancelarPedido(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorization) {
        
        Map<String, Object> response = new HashMap<>();
        
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            response.put("success", false);
            response.put("message", "Sessão inválida");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            pedidoService.cancelarPedido(id, clienteId);
            response.put("success", true);
            response.put("message", "Pedido cancelado com sucesso");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/numero/{numeroPedido}")
    public ResponseEntity<Pedido> buscarPedidoPorNumero(@PathVariable String numeroPedido) {
        try {
            Pedido pedido = pedidoService.buscarPedidoPorNumero(numeroPedido);
            return ResponseEntity.ok(pedido);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // ===== ENDPOINTS ADMINISTRATIVOS =====
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> atualizarStatusPedido(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authorization) {
        
        Map<String, Object> response = new HashMap<>();
        
        // Aqui você pode validar se é um admin usando o AuthService existente
        
        try {
            Pedido.PedidoStatus novoStatus = Pedido.PedidoStatus.valueOf(request.get("status"));
            Pedido pedido = pedidoService.atualizarStatus(id, novoStatus);
            
            response.put("success", true);
            response.put("message", "Status atualizado com sucesso");
            response.put("pedido", pedido);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    private Long validateClienteSession(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }
        
        String token = authorization.substring(7);
        return clienteSessionService.validateSession(token);
    }
}
