package com.goiashop.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.repository.ProdutoRepository;

@RestController
@RequestMapping("/api/admin/produtos")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class AdminProdutoController {

    @Autowired
    private ProdutoRepository produtoRepository;


    
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
    

}