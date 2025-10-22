package com.goiashop.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goiashop.dto.CustomerSignupRequest;
import com.goiashop.dto.EnderecoRequest;
import com.goiashop.model.Customer;
import com.goiashop.model.CustomerAddress;
import com.goiashop.model.CustomerAuth;
import com.goiashop.repository.CustomerAuthRepository;
import com.goiashop.repository.CustomerRepository;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerAuthRepository customerAuthRepository;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private ViaCepService viaCepService;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public Customer cadastrarCliente(CustomerSignupRequest request) {
        // Validações
        validarCadastro(request);

        // Extrair nome e sobrenome
        String[] nomeParts = request.getNomeCompleto().trim().split("\\s+", 2);
        String nome = nomeParts[0];
        String sobrenome = nomeParts.length > 1 ? nomeParts[1] : "";

        // Criar customer
        Customer customer = new Customer();
        customer.setNome(nome);
        customer.setSobrenome(sobrenome);
        customer.setCpf(request.getCpf());
        customer.setDataNascimento(request.getDataNascimento());
        customer.setGenero(request.getGenero());
        customer.setCreatedAt(LocalDateTime.now());

        // Criar auth
        CustomerAuth auth = new CustomerAuth();
        auth.setEmail(request.getEmail());
        // BCrypt do SHA-256 recebido
        auth.setSenhaHash(passwordService.encryptPassword(request.getSenhaHash()));
        auth.setEmailVerified(false);
        auth.setCreatedAt(LocalDateTime.now());
        
        customer.setAuth(auth);

        // Adicionar endereço de faturamento
        CustomerAddress enderecoFat = criarEndereco(request.getEnderecoFaturamento(), CustomerAddress.TipoEndereco.FATURAMENTO);
        enderecoFat.setIsDefault(true);
        customer.addEndereco(enderecoFat);

        // Adicionar endereços de entrega
        for (int i = 0; i < request.getEnderecosEntrega().size(); i++) {
            EnderecoRequest endReq = request.getEnderecosEntrega().get(i);
            CustomerAddress enderecoEnt = criarEndereco(endReq, CustomerAddress.TipoEndereco.ENTREGA);
            enderecoEnt.setIsDefault(i == 0 && endReq.getIsPrincipal());
            customer.addEndereco(enderecoEnt);
        }

        // Salvar
        Customer savedCustomer = customerRepository.save(customer);

        // Auditoria
        try {
            auditLogService.logCustomerCreation(savedCustomer.getId(), savedCustomer.getNomeCompleto());
        } catch (Exception e) {
            // Log error but don't fail the registration
            System.err.println("Erro ao criar log de auditoria: " + e.getMessage());
        }

        return savedCustomer;
    }

    private void validarCadastro(CustomerSignupRequest request) {
        // Validar CPF único
        if (customerRepository.existsByCpf(request.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado");
        }

        // Validar email único
        if (customerAuthRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        // Validar CPF (dígitos verificadores)
        if (!validarCPF(request.getCpf())) {
            throw new IllegalArgumentException("CPF inválido");
        }

        // Validar CEP do endereço de faturamento
        if (!viaCepService.validarCep(request.getEnderecoFaturamento().getCep())) {
            throw new IllegalArgumentException("CEP de faturamento inválido");
        }

        // Validar CEPs dos endereços de entrega
        for (EnderecoRequest endereco : request.getEnderecosEntrega()) {
            if (!viaCepService.validarCep(endereco.getCep())) {
                throw new IllegalArgumentException("CEP de entrega inválido: " + endereco.getCep());
            }
        }
    }

    private CustomerAddress criarEndereco(EnderecoRequest request, CustomerAddress.TipoEndereco tipo) {
        CustomerAddress endereco = new CustomerAddress();
        endereco.setTipo(tipo);
        endereco.setCep(request.getCep());
        endereco.setLogradouro(request.getLogradouro());
        endereco.setNumero(request.getNumero());
        endereco.setComplemento(request.getComplemento());
        endereco.setBairro(request.getBairro());
        endereco.setCidade(request.getCidade());
        endereco.setUf(request.getUf());
        endereco.setCreatedAt(LocalDateTime.now());
        return endereco;
    }

    public boolean validarCPF(String cpf) {
        // Remove caracteres não numéricos
        cpf = cpf.replaceAll("\\D", "");

        // Verifica se tem 11 dígitos
        if (cpf.length() != 11) {
            return false;
        }

        // Verifica se todos os dígitos são iguais
        if (cpf.matches("(\\d)\\1{10}")) {
            return false;
        }

        try {
            // Calcula o primeiro dígito verificador
            int soma = 0;
            for (int i = 0; i < 9; i++) {
                soma += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
            }
            int primeiroDigito = 11 - (soma % 11);
            if (primeiroDigito >= 10) {
                primeiroDigito = 0;
            }

            // Verifica o primeiro dígito
            if (Character.getNumericValue(cpf.charAt(9)) != primeiroDigito) {
                return false;
            }

            // Calcula o segundo dígito verificador
            soma = 0;
            for (int i = 0; i < 10; i++) {
                soma += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
            }
            int segundoDigito = 11 - (soma % 11);
            if (segundoDigito >= 10) {
                segundoDigito = 0;
            }

            // Verifica o segundo dígito
            return Character.getNumericValue(cpf.charAt(10)) == segundoDigito;
        } catch (Exception e) {
            return false;
        }
    }
}
