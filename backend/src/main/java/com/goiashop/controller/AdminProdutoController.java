package com.goiashop.controller;

import com.goiashop.model.Produto;
import com.goiashop.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/produtos")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class AdminProdutoController {

    @Autowired
    private ProdutoRepository produtoRepository;

    @PostMapping("/criar-mockados")
    public ResponseEntity<Map<String, Object>> criarProdutosMockados() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Verificar se já existem produtos
            long count = produtoRepository.count();
            
            if (count > 0) {
                response.put("success", false);
                response.put("message", "Já existem " + count + " produtos no sistema");
                return ResponseEntity.ok(response);
            }
            
            // Criar produtos mockados
            createProdutoIfNotExists("iPhone 15 Pro", 
                "iPhone 15 Pro 128GB, Tela 6.1\", Câmera Pro 48MP, 5G, Titânio Natural", 
                new BigDecimal("4599.00"), 25);
                
            createProdutoIfNotExists("Samsung Galaxy S24", 
                "Samsung Galaxy S24 256GB, Tela 6.2\", Câmera 50MP, 5G, AI Phone", 
                new BigDecimal("3299.00"), 30);
                
            createProdutoIfNotExists("MacBook Pro M3", 
                "MacBook Pro 14\" M3, 8GB RAM, SSD 512GB, Tela Liquid Retina XDR", 
                new BigDecimal("4299.00"), 15);
                
            createProdutoIfNotExists("Dell XPS 13", 
                "Notebook Dell XPS 13, Intel i7, 16GB RAM, SSD 512GB, Tela 13.4\"", 
                new BigDecimal("2899.00"), 20);
                
            createProdutoIfNotExists("PlayStation 5", 
                "Console PlayStation 5 Standard, SSD 825GB, Controle DualSense", 
                new BigDecimal("2399.00"), 12);
                
            createProdutoIfNotExists("Nintendo Switch OLED", 
                "Nintendo Switch OLED 64GB, Tela 7\", Joy-Con Neon, Dock incluído", 
                new BigDecimal("1799.00"), 18);
                
            createProdutoIfNotExists("AirPods Pro 2ª Geração", 
                "Apple AirPods Pro 2ª Geração, Cancelamento Ativo, Case MagSafe", 
                new BigDecimal("1299.00"), 35);
                
            createProdutoIfNotExists("iPad Air 5ª Geração", 
                "iPad Air 10.9\" M1, 64GB Wi-Fi, Câmera 12MP, Touch ID", 
                new BigDecimal("2199.00"), 22);
                
            createProdutoIfNotExists("Echo Dot 5ª Geração", 
                "Amazon Echo Dot com Alexa, Som premium, Smart Home Hub", 
                new BigDecimal("599.00"), 50);
                
            createProdutoIfNotExists("Kindle Paperwhite", 
                "Kindle Paperwhite 11ª Geração, Tela 6.8\", À prova d'água, 16GB", 
                new BigDecimal("899.00"), 40);
            
            response.put("success", true);
            response.put("message", "10 produtos mockados criados com sucesso!");
            response.put("total", 10);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Erro ao criar produtos: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> verificarStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            long count = produtoRepository.count();
            var produtos = produtoRepository.findAll();
            
            response.put("success", true);
            response.put("totalProdutos", count);
            response.put("produtos", produtos);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erro ao verificar status: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    private void createProdutoIfNotExists(String nome, String descricao, BigDecimal preco, Integer estoque) {
        Produto produto = new Produto();
        produto.setNome(nome);
        produto.setDescricao(descricao);
        produto.setPreco(preco);
        produto.setQuantidadeEstoque(estoque);
        produto.setStatus(Produto.ProdutoStatus.ATIVO);
        produto.setAvaliacao(4.0 + (Math.random() * 1.0)); // Avaliação entre 4.0 e 5.0
        
        produtoRepository.save(produto);
        System.out.println("📦 Produto criado: " + nome + " - R$ " + preco);
    }
}