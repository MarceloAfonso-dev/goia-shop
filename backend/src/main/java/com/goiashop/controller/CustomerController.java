package com.goiashop.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.dto.CustomerSignupRequest;
import com.goiashop.dto.ViaCepResponse;
import com.goiashop.model.Customer;
import com.goiashop.service.CustomerService;
import com.goiashop.service.ViaCepService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/store/customers")
@CrossOrigin(origins = {"http://localhost:3000", "http://frontend:3000"})
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private ViaCepService viaCepService;

    @PostMapping("/signup")
    public ResponseEntity<?> cadastrarCliente(@Valid @RequestBody CustomerSignupRequest request, BindingResult result) {
        try {
            // Validar erros de binding
            if (result.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                result.getFieldErrors().forEach(error -> 
                    errors.put(error.getField(), error.getDefaultMessage())
                );
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(errors);
            }

            // Cadastrar cliente
            Customer customer = customerService.cadastrarCliente(request);

            // Resposta de sucesso
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cadastro realizado com sucesso!");
            response.put("customerId", customer.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            // Erros de validação de negócio (email/CPF duplicado, CEP inválido, etc)
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            
            // Retorna 409 para duplicados, 422 para validações
            HttpStatus status = e.getMessage().contains("já cadastrado") ? 
                HttpStatus.CONFLICT : HttpStatus.UNPROCESSABLE_ENTITY;
            
            return ResponseEntity.status(status).body(error);

        } catch (Exception e) {
            // Erro interno do servidor
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erro ao processar cadastro: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/validate-cep/{cep}")
    public ResponseEntity<?> validarCep(@PathVariable String cep) {
        try {
            ViaCepResponse response = viaCepService.consultarCep(cep);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/validate-cpf/{cpf}")
    public ResponseEntity<?> validarCpf(@PathVariable String cpf) {
        Map<String, Object> response = new HashMap<>();
        boolean isValid = customerService.validarCPF(cpf);
        response.put("valid", isValid);
        return ResponseEntity.ok(response);
    }
}
