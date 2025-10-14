package com.goiashop.controller;

import com.goiashop.dto.ClienteRegistroRequest;
import com.goiashop.model.Cliente;
import com.goiashop.service.ClienteService;
import com.goiashop.service.ClienteSessionService;
import com.goiashop.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cliente")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class ClienteController {
    
    @Autowired
    private ClienteService clienteService;
    
    @Autowired
    private ClienteSessionService clienteSessionService;
    
    @Autowired
    private PedidoService pedidoService;
    
    @GetMapping("/perfil")
    public ResponseEntity<Map<String, Object>> obterPerfil(@RequestHeader("Authorization") String authorization) {
        Map<String, Object> response = new HashMap<>();
        
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            response.put("success", false);
            response.put("message", "Sessão inválida");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            Cliente cliente = clienteService.buscarPorId(clienteId);
            Long totalPedidos = pedidoService.contarPedidosCliente(clienteId);
            
            Map<String, Object> dadosCliente = new HashMap<>();
            dadosCliente.put("id", cliente.getId());
            dadosCliente.put("nome", cliente.getNome());
            dadosCliente.put("email", cliente.getEmail());
            dadosCliente.put("cpf", cliente.getCpf());
            dadosCliente.put("telefone", cliente.getTelefone());
            dadosCliente.put("dataNascimento", cliente.getDataNascimento());
            
            // Endereço
            Map<String, Object> endereco = new HashMap<>();
            endereco.put("cep", cliente.getCep());
            endereco.put("logradouro", cliente.getLogradouro());
            endereco.put("numero", cliente.getNumero());
            endereco.put("complemento", cliente.getComplemento());
            endereco.put("bairro", cliente.getBairro());
            endereco.put("cidade", cliente.getCidade());
            endereco.put("estado", cliente.getEstado());
            
            dadosCliente.put("endereco", endereco);
            dadosCliente.put("totalPedidos", totalPedidos);
            dadosCliente.put("status", cliente.getStatus().toString());
            dadosCliente.put("createdAt", cliente.getCreatedAt());
            
            response.put("success", true);
            response.put("cliente", dadosCliente);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/perfil")
    public ResponseEntity<Map<String, Object>> atualizarPerfil(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody ClienteRegistroRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            response.put("success", false);
            response.put("message", "Sessão inválida");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            Cliente cliente = clienteService.atualizarCliente(clienteId, request);
            
            response.put("success", true);
            response.put("message", "Perfil atualizado com sucesso");
            response.put("cliente", Map.of(
                "id", cliente.getId(),
                "nome", cliente.getNome(),
                "email", cliente.getEmail(),
                "tipo", "CLIENTE"
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/alterar-senha")
    public ResponseEntity<Map<String, String>> alterarSenha(
            @RequestHeader("Authorization") String authorization,
            @RequestBody Map<String, String> request) {
        
        Map<String, String> response = new HashMap<>();
        
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            response.put("success", "false");
            response.put("message", "Sessão inválida");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            String senhaAtual = request.get("senhaAtual");
            String novaSenha = request.get("novaSenha");
            
            // Buscar cliente
            Cliente cliente = clienteService.buscarPorId(clienteId);
            
            // Verificar senha atual (você precisa implementar este método no ClienteService)
            // clienteService.verificarSenha(cliente, senhaAtual);
            
            // Criar request de atualização apenas com a nova senha
            ClienteRegistroRequest updateRequest = new ClienteRegistroRequest();
            updateRequest.setNome(cliente.getNome());
            updateRequest.setEmail(cliente.getEmail());
            updateRequest.setCpf(cliente.getCpf());
            updateRequest.setTelefone(cliente.getTelefone());
            updateRequest.setDataNascimento(cliente.getDataNascimento().toString());
            updateRequest.setCep(cliente.getCep());
            updateRequest.setLogradouro(cliente.getLogradouro());
            updateRequest.setNumero(cliente.getNumero());
            updateRequest.setComplemento(cliente.getComplemento());
            updateRequest.setBairro(cliente.getBairro());
            updateRequest.setCidade(cliente.getCidade());
            updateRequest.setEstado(cliente.getEstado());
            updateRequest.setSenha(novaSenha);
            
            clienteService.atualizarCliente(clienteId, updateRequest);
            
            response.put("success", "true");
            response.put("message", "Senha alterada com sucesso");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", "false");
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
