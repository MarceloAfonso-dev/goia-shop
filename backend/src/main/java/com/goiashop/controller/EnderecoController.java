package com.goiashop.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.dto.EnderecoEntregaRequest;
import com.goiashop.dto.EnderecoEntregaResponse;
import com.goiashop.model.EnderecoEntrega;
import com.goiashop.service.ClienteSessionService;
import com.goiashop.service.EnderecoEntregaService;
import com.goiashop.service.ViaCepService;

@RestController
@RequestMapping("/api/enderecos")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class EnderecoController {
    
    @Autowired
    private EnderecoEntregaService enderecoService;
    
    @Autowired
    private ClienteSessionService clienteSessionService;
    
    @Autowired
    private ViaCepService viaCepService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> listarEnderecos(
            @RequestHeader("Authorization") String authorization) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validar sessão do cliente
            Long clienteId = validateClienteSession(authorization);
            if (clienteId == null) {
                response.put("success", false);
                response.put("message", "Sessão inválida");
                return ResponseEntity.status(401).body(response);
            }
            
            // Buscar endereços do cliente
            List<EnderecoEntrega> enderecos = enderecoService.listarEnderecosPorCliente(clienteId);
            
            // Converter para DTOs de resposta
            List<EnderecoEntregaResponse> enderecosResponse = enderecos.stream()
                .map(EnderecoEntregaResponse::new)
                .collect(Collectors.toList());
            
            response.put("success", true);
            response.put("enderecos", enderecosResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> criarEndereco(
            @RequestHeader("Authorization") String authorization,
            @RequestBody EnderecoEntregaRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long clienteId = validateClienteSession(authorization);
            if (clienteId == null) {
                response.put("success", false);
                response.put("message", "Sessão inválida");
                return ResponseEntity.status(401).body(response);
            }
            
            EnderecoEntrega endereco = enderecoService.adicionarEndereco(clienteId, request);
            EnderecoEntregaResponse enderecoResponse = new EnderecoEntregaResponse(endereco);
            
            response.put("success", true);
            response.put("message", "Endereço criado com sucesso");
            response.put("endereco", enderecoResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> atualizarEndereco(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorization,
            @RequestBody EnderecoEntregaRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long clienteId = validateClienteSession(authorization);
            if (clienteId == null) {
                response.put("success", false);
                response.put("message", "Sessão inválida");
                return ResponseEntity.status(401).body(response);
            }
            
            EnderecoEntrega endereco = enderecoService.atualizarEndereco(id, clienteId, request);
            EnderecoEntregaResponse enderecoResponse = new EnderecoEntregaResponse(endereco);
            
            response.put("success", true);
            response.put("message", "Endereço atualizado com sucesso");
            response.put("endereco", enderecoResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletarEndereco(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorization) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long clienteId = validateClienteSession(authorization);
            if (clienteId == null) {
                response.put("success", false);
                response.put("message", "Sessão inválida");
                return ResponseEntity.status(401).body(response);
            }
            
            enderecoService.removerEndereco(id, clienteId);
            
            response.put("success", true);
            response.put("message", "Endereço removido com sucesso");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/consultar-cep/{cep}")
    public ResponseEntity<Map<String, Object>> consultarCep(@PathVariable String cep) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            ViaCepService.CepResponse cepData = viaCepService.consultarCep(cep);
            
            Map<String, String> endereco = new HashMap<>();
            endereco.put("cep", cepData.getCep());
            endereco.put("logradouro", cepData.getLogradouro());
            endereco.put("bairro", cepData.getBairro());
            endereco.put("cidade", cepData.getLocalidade());
            endereco.put("estado", cepData.getUf());
            endereco.put("complemento", cepData.getComplemento());
            
            response.put("success", true);
            response.put("endereco", endereco);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    private Long validateClienteSession(String authorization) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return null;
            }
            
            String token = authorization.substring(7);
            return clienteSessionService.validateSession(token);
        } catch (Exception e) {
            return null;
        }
    }
}