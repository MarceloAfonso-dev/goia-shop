package com.goiashop.controller;

import com.goiashop.dto.ClienteRegistroRequest;
import com.goiashop.dto.LoginRequest;
import com.goiashop.dto.LoginResponse;
import com.goiashop.model.Cliente;
import com.goiashop.service.AuthService;
import com.goiashop.service.ClienteService;
import com.goiashop.service.ClienteSessionService;
import com.goiashop.service.PasswordService;
import com.goiashop.util.CPFValidator;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private PasswordService passwordService;
    
    @Autowired
    private ClienteService clienteService;
    
    @Autowired
    private ClienteSessionService clienteSessionService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            authService.logout(token);
        }
        return ResponseEntity.ok("Logout realizado com sucesso");
    }
    
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            boolean isValid = authService.validateSession(token) != null;
            return ResponseEntity.ok(isValid);
        }
        return ResponseEntity.ok(false);
    }
    
    @GetMapping("/is-admin")
    public ResponseEntity<Boolean> isAdmin(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            boolean isAdmin = authService.isAdmin(token);
            return ResponseEntity.ok(isAdmin);
        }
        return ResponseEntity.ok(false);
    }
    
    // ===== ENDPOINTS PARA CLIENTES =====
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registrarCliente(@Valid @RequestBody ClienteRegistroRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Cliente cliente = clienteService.registrarCliente(request);
            
            // Criar sessão automática após registro
            String token = clienteSessionService.createSession(cliente);
            
            response.put("success", true);
            response.put("message", "Cliente registrado com sucesso");
            response.put("token", token);
            
            // Retornar todos os dados do cliente (exceto senha)
            Map<String, Object> clienteData = new HashMap<>();
            clienteData.put("id", cliente.getId());
            clienteData.put("nome", cliente.getNome());
            clienteData.put("email", cliente.getEmail());
            clienteData.put("cpf", cliente.getCpf());
            clienteData.put("telefone", cliente.getTelefone());
            clienteData.put("dataNascimento", cliente.getDataNascimento() != null ? cliente.getDataNascimento().toString() : null);
            clienteData.put("genero", cliente.getGenero() != null ? cliente.getGenero().toString() : null);
            clienteData.put("cep", cliente.getCep());
            clienteData.put("logradouro", cliente.getLogradouro());
            clienteData.put("numero", cliente.getNumero());
            clienteData.put("complemento", cliente.getComplemento());
            clienteData.put("bairro", cliente.getBairro());
            clienteData.put("cidade", cliente.getCidade());
            clienteData.put("uf", cliente.getEstado());
            clienteData.put("tipo", "CLIENTE");
            
            response.put("cliente", clienteData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/login-cliente")
    public ResponseEntity<Map<String, Object>> loginCliente(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Cliente cliente = clienteService.autenticarCliente(request.getEmail(), request.getSenha());
            String token = clienteSessionService.createSession(cliente);
            
            response.put("success", true);
            response.put("message", "Login realizado com sucesso");
            response.put("token", token);
            
            // Retornar todos os dados do cliente (exceto senha)
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", cliente.getId());
            userData.put("nome", cliente.getNome());
            userData.put("email", cliente.getEmail());
            userData.put("cpf", cliente.getCpf());
            userData.put("telefone", cliente.getTelefone());
            userData.put("dataNascimento", cliente.getDataNascimento() != null ? cliente.getDataNascimento().toString() : null);
            userData.put("genero", cliente.getGenero() != null ? cliente.getGenero().toString() : null);
            userData.put("cep", cliente.getCep());
            userData.put("logradouro", cliente.getLogradouro());
            userData.put("numero", cliente.getNumero());
            userData.put("complemento", cliente.getComplemento());
            userData.put("bairro", cliente.getBairro());
            userData.put("cidade", cliente.getCidade());
            userData.put("uf", cliente.getEstado());
            userData.put("tipo", "CLIENTE");
            
            response.put("user", userData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/logout-cliente")
    public ResponseEntity<Map<String, String>> logoutCliente(@RequestHeader("Authorization") String token) {
        Map<String, String> response = new HashMap<>();
        
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            clienteSessionService.removeSession(token);
        }
        
        response.put("message", "Logout realizado com sucesso");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/validate-cliente")
    public ResponseEntity<Map<String, Object>> validateClienteToken(@RequestHeader("Authorization") String token) {
        Map<String, Object> response = new HashMap<>();
        
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            Long clienteId = clienteSessionService.validateSession(token);
            
            if (clienteId != null) {
                try {
                    Cliente cliente = clienteService.buscarPorId(clienteId);
                    response.put("valid", true);
                    
                    // Retornar todos os dados do cliente (exceto senha)
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
                    
                    response.put("cliente", clienteData);
                } catch (Exception e) {
                    response.put("valid", false);
                }
            } else {
                response.put("valid", false);
            }
        } else {
            response.put("valid", false);
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Valida se um CPF já existe no banco de dados
     */
    @PostMapping("/validate-cpf")
    public ResponseEntity<Map<String, Object>> validateCPF(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String cpf = request.get("cpf");
            
            if (cpf == null || cpf.trim().isEmpty()) {
                response.put("valid", false);
                response.put("message", "CPF é obrigatório");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Validar formato do CPF
            if (!CPFValidator.isValid(cpf)) {
                response.put("valid", false);
                response.put("message", "CPF inválido");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Limpar CPF (remover formatação)
            String cpfLimpo = CPFValidator.cleanCPF(cpf);
            
            // Verificar se já existe
            boolean exists = clienteService.existsByCpf(cpfLimpo);
            
            if (exists) {
                response.put("valid", false);
                response.put("message", "CPF já está cadastrado");
                return ResponseEntity.ok(response);
            } else {
                response.put("valid", true);
                response.put("message", "CPF disponível");
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            response.put("valid", false);
            response.put("message", "Erro interno: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
}
