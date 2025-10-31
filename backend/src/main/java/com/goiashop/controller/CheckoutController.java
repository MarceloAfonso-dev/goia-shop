package com.goiashop.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.dto.CartItemRequest;
import com.goiashop.model.Produto;
import com.goiashop.service.ClienteSessionService;
import com.goiashop.service.ProdutoService;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class CheckoutController {
    
    @Autowired
    private ProdutoService produtoService;
    
    @Autowired
    private ClienteSessionService clienteSessionService;
    
    /**
     * Gerar resumo do pedido com preços e estoque atualizados
     */
    @PostMapping("/summary")
    public ResponseEntity<Map<String, Object>> gerarResumo(
            @RequestHeader("Authorization") String authorization,
            @RequestBody Map<String, Object> requestBody) {
        
        Map<String, Object> response = new HashMap<>();
        
        // Validar sessão do cliente
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            response.put("success", false);
            response.put("message", "Sessão inválida");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            // Extrair dados do request
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itensData = (List<Map<String, Object>>) requestBody.get("itens");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> dadosPedido = (Map<String, Object>) requestBody.get("pedido");
            
            // Converter para CartItemRequest
            List<CartItemRequest> itensCarrinho = itensData.stream()
                .map(item -> {
                    CartItemRequest cartItem = new CartItemRequest();
                    cartItem.setProdutoId(Long.valueOf(item.get("produtoId").toString()));
                    cartItem.setQuantidade(Integer.valueOf(item.get("quantidade").toString()));
                    return cartItem;
                })
                .collect(Collectors.toList());
            
            // Montar resumo com dados atualizados
            List<Map<String, Object>> itensResumo = itensCarrinho.stream()
                .map(item -> {
                    try {
                        Produto produto = produtoService.buscarProdutoPublico(item.getProdutoId());
                        
                        Map<String, Object> itemResumo = new HashMap<>();
                        itemResumo.put("produtoId", produto.getId());
                        itemResumo.put("nome", produto.getNome());
                        itemResumo.put("precoUnitario", produto.getPreco());
                        itemResumo.put("quantidade", item.getQuantidade());
                        itemResumo.put("precoTotal", produto.getPreco().multiply(BigDecimal.valueOf(item.getQuantidade())));
                        itemResumo.put("estoque", produto.getQuantidade());
                        itemResumo.put("ativo", produto.getStatus() == Produto.ProdutoStatus.ATIVO);
                        itemResumo.put("estoqueInsuficiente", produto.getQuantidade() < item.getQuantidade());
                        
                        return itemResumo;
                        
                    } catch (Exception e) {
                        // Produto não encontrado ou inativo
                        Map<String, Object> itemResumo = new HashMap<>();
                        itemResumo.put("produtoId", item.getProdutoId());
                        itemResumo.put("nome", "Produto não encontrado");
                        itemResumo.put("precoUnitario", BigDecimal.ZERO);
                        itemResumo.put("quantidade", item.getQuantidade());
                        itemResumo.put("precoTotal", BigDecimal.ZERO);
                        itemResumo.put("estoque", 0);
                        itemResumo.put("ativo", false);
                        itemResumo.put("estoqueInsuficiente", true);
                        
                        return itemResumo;
                    }
                })
                .collect(Collectors.toList());
            
            // Calcular totais
            BigDecimal subtotal = itensResumo.stream()
                .map(item -> (BigDecimal) item.get("precoTotal"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal frete = BigDecimal.ZERO; // Por enquanto frete grátis
            BigDecimal total = subtotal.add(frete);
            
            // Verificar se há problemas com os itens
            boolean temProblemasEstoque = itensResumo.stream()
                .anyMatch(item -> (Boolean) item.get("estoqueInsuficiente"));
            
            boolean temProdutosInativos = itensResumo.stream()
                .anyMatch(item -> !(Boolean) item.get("ativo"));
            
            // Montar resposta
            response.put("success", true);
            response.put("itens", itensResumo);
            response.put("subtotal", subtotal);
            response.put("frete", frete);
            response.put("total", total);
            response.put("temProblemasEstoque", temProblemasEstoque);
            response.put("temProdutosInativos", temProdutosInativos);
            response.put("podeFinalizarCompra", !temProblemasEstoque && !temProdutosInativos);
            
            // Incluir dados do pedido (endereço e pagamento)
            if (dadosPedido != null) {
                response.put("endereco", dadosPedido.get("endereco"));
                response.put("pagamento", dadosPedido.get("pagamento"));
            }
            
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