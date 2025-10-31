package com.goiashop.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.dto.FreteOption;
import com.goiashop.dto.FreteRequest;
import com.goiashop.service.FreteService;

@RestController
@RequestMapping("/api/frete")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class FreteController {
    
    @Autowired
    private FreteService freteService;
    
    /**
     * Calcula as opções de frete para um CEP
     */
    @PostMapping("/calcular")
    public ResponseEntity<Map<String, Object>> calcularFrete(@RequestBody FreteRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<FreteOption> opcoes = freteService.calcularFrete(
                request.getCep(), 
                request.getValorTotal()
            );
            
            response.put("success", true);
            response.put("opcoes", opcoes);
            response.put("cep", request.getCep());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Simular frete no carrinho (sem necessidade de autenticação)
     */
    @PostMapping("/simular")
    public ResponseEntity<Map<String, Object>> simularFrete(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String cep = (String) request.get("cep");
            Double valorTotal = 0.0;
            
            // Verificar se foi passado um valor total
            if (request.containsKey("valorTotal")) {
                Object valor = request.get("valorTotal");
                if (valor instanceof Number) {
                    valorTotal = ((Number) valor).doubleValue();
                } else if (valor instanceof String) {
                    valorTotal = Double.parseDouble((String) valor);
                }
            }
            
            // Se não foi passado valor total, usar um valor padrão para simulação
            if (valorTotal <= 0) {
                valorTotal = 100.0;
            }
            
            List<FreteOption> opcoes = freteService.calcularFrete(cep, valorTotal);
            
            response.put("success", true);
            response.put("opcoes", opcoes);
            response.put("cep", cep);
            response.put("valorTotal", valorTotal);
            response.put("message", "Simulação de frete realizada com sucesso");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Validar CEP (endpoint auxiliar)
     */
    @GetMapping("/validar-cep/{cep}")
    public ResponseEntity<Map<String, Object>> validarCEP(@PathVariable String cep) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Usar o serviço de frete para validar o CEP
            freteService.calcularFrete(cep, 100.0);
            
            response.put("success", true);
            response.put("message", "CEP válido");
            response.put("cep", cep);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}