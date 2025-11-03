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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.dto.ClientePerfilRequest;
import com.goiashop.dto.ClienteRegistroRequest;
import com.goiashop.dto.EnderecoEntregaRequest;
import com.goiashop.dto.EnderecoEntregaResponse;
import com.goiashop.model.Cliente;
import com.goiashop.model.EnderecoEntrega;
import com.goiashop.service.ClienteService;
import com.goiashop.service.ClienteSessionService;
import com.goiashop.service.EnderecoEntregaService;
import com.goiashop.service.PedidoService;

import jakarta.validation.Valid;

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
    
    @Autowired
    private EnderecoEntregaService enderecoService;
    
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
            @RequestBody ClientePerfilRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            response.put("success", false);
            response.put("message", "Sessão inválida");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            Cliente cliente = clienteService.atualizarPerfil(clienteId, request);
            
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
            // String senhaAtual = request.get("senhaAtual"); // TODO: implementar verificação de senha atual
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
    
    // ===== ENDPOINTS PARA ENDEREÇOS DE ENTREGA =====
    
    /**
     * Listar todos os endereços de entrega do cliente
     */
    @GetMapping("/enderecos")
    public ResponseEntity<Map<String, Object>> listarEnderecos(@RequestHeader("Authorization") String authorization) {
        Map<String, Object> response = new HashMap<>();
        
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            response.put("success", false);
            response.put("message", "Sessão inválida");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            List<EnderecoEntrega> enderecos = enderecoService.listarEnderecosPorCliente(clienteId);
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
    
    /**
     * Buscar endereço padrão do cliente
     */
    @GetMapping("/enderecos/padrao")
    public ResponseEntity<Map<String, Object>> buscarEnderecoPadrao(@RequestHeader("Authorization") String authorization) {
        Map<String, Object> response = new HashMap<>();
        
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            response.put("success", false);
            response.put("message", "Sessão inválida");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            java.util.Optional<EnderecoEntrega> enderecoPadrao = enderecoService.buscarEnderecoPadrao(clienteId);
            
            if (enderecoPadrao.isPresent()) {
                response.put("success", true);
                response.put("endereco", new EnderecoEntregaResponse(enderecoPadrao.get()));
            } else {
                response.put("success", false);
                response.put("message", "Nenhum endereço padrão cadastrado");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Adicionar novo endereço de entrega
     */
    @PostMapping("/enderecos")
    public ResponseEntity<Map<String, Object>> adicionarEndereco(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody EnderecoEntregaRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            response.put("success", false);
            response.put("message", "Sessão inválida");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            EnderecoEntrega endereco = enderecoService.adicionarEndereco(clienteId, request);
            
            response.put("success", true);
            response.put("message", "Endereço adicionado com sucesso");
            response.put("endereco", new EnderecoEntregaResponse(endereco));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Atualizar endereço de entrega existente
     */
    @PutMapping("/enderecos/{enderecoId}")
    public ResponseEntity<Map<String, Object>> atualizarEndereco(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long enderecoId,
            @Valid @RequestBody EnderecoEntregaRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            response.put("success", false);
            response.put("message", "Sessão inválida");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            EnderecoEntrega endereco = enderecoService.atualizarEndereco(enderecoId, clienteId, request);
            
            response.put("success", true);
            response.put("message", "Endereço atualizado com sucesso");
            response.put("endereco", new EnderecoEntregaResponse(endereco));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Definir endereço como padrão
     */
    @PatchMapping("/enderecos/{enderecoId}/padrao")
    public ResponseEntity<Map<String, Object>> definirEnderecoPadrao(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long enderecoId) {
        
        Map<String, Object> response = new HashMap<>();
        
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            response.put("success", false);
            response.put("message", "Sessão inválida");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            EnderecoEntrega endereco = enderecoService.definirEnderecoPadrao(enderecoId, clienteId);
            
            response.put("success", true);
            response.put("message", "Endereço definido como padrão");
            response.put("endereco", new EnderecoEntregaResponse(endereco));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Remover endereço de entrega
     */
    @DeleteMapping("/enderecos/{enderecoId}")
    public ResponseEntity<Map<String, Object>> removerEndereco(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long enderecoId) {
        
        Map<String, Object> response = new HashMap<>();
        
        Long clienteId = validateClienteSession(authorization);
        if (clienteId == null) {
            response.put("success", false);
            response.put("message", "Sessão inválida");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            enderecoService.removerEndereco(enderecoId, clienteId);
            
            response.put("success", true);
            response.put("message", "Endereço removido com sucesso");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
