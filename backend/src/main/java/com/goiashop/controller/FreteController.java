package com.goiashop.controller;

import com.goiashop.dto.FreteOption;
import com.goiashop.dto.FreteRequest;
import com.goiashop.service.FreteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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