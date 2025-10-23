package com.goiashop.controller;

import com.goiashop.dto.ClienteAtualizacaoRequest;
import com.goiashop.model.Cliente;
import com.goiashop.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class ClientesController {
    
    @Autowired
    private ClienteService clienteService;
    
    /**
     * Atualizar dados do cliente
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> atualizarCliente(
            @PathVariable Long id,
            @Valid @RequestBody ClienteAtualizacaoRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Cliente cliente = clienteService.atualizarClienteDados(id, request);
            
            // Retornar todos os dados atualizados
            Map<String, Object> clienteData = new HashMap<>();
            clienteData.put("id", cliente.getId());
            clienteData.put("nome", cliente.getNome());
            clienteData.put("email", cliente.getEmail());
            clienteData.put("cpf", cliente.getCpf());
            clienteData.put("telefone", cliente.getTelefone());
            clienteData.put("dataNascimento", cliente.getDataNascimento() != null ? cliente.getDataNascimento().toString() : null);
            clienteData.put("cep", cliente.getCep());
            clienteData.put("logradouro", cliente.getLogradouro());
            clienteData.put("numero", cliente.getNumero());
            clienteData.put("complemento", cliente.getComplemento());
            clienteData.put("bairro", cliente.getBairro());
            clienteData.put("cidade", cliente.getCidade());
            clienteData.put("uf", cliente.getEstado());
            clienteData.put("tipo", "CLIENTE");
            
            response.put("success", true);
            response.put("message", "Dados atualizados com sucesso");
            response.put("data", clienteData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}

