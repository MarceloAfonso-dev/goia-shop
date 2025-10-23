package com.goiashop.service;

import com.goiashop.dto.ClienteRegistroRequest;
import com.goiashop.model.Cliente;
import com.goiashop.repository.ClienteRepository;
import com.goiashop.util.CPFValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class ClienteService {
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private PasswordService passwordService;
    
    public Cliente registrarCliente(ClienteRegistroRequest request) {
        // Verificar se email já existe
        if (clienteRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email já está em uso");
        }
        
        // Validar formato do CPF
        if (!CPFValidator.isValid(request.getCpf())) {
            throw new RuntimeException("CPF inválido");
        }
        
        // Verificar se CPF já existe
        String cpfLimpo = CPFValidator.cleanCPF(request.getCpf());
        if (clienteRepository.existsByCpf(cpfLimpo)) {
            throw new RuntimeException("CPF já está cadastrado");
        }
        
        // Criar cliente
        Cliente cliente = new Cliente();
        cliente.setNome(request.getNome());
        cliente.setEmail(request.getEmail());
        cliente.setCpf(cpfLimpo);
        cliente.setTelefone(request.getTelefone());
        
        // Converter data de nascimento
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            cliente.setDataNascimento(LocalDate.parse(request.getDataNascimento(), formatter));
        } catch (Exception e) {
            throw new RuntimeException("Formato de data inválido. Use yyyy-MM-dd");
        }
        
        // Definir gênero se fornecido
        if (request.getGenero() != null && !request.getGenero().isEmpty()) {
            try {
                cliente.setGenero(Cliente.Genero.valueOf(request.getGenero()));
            } catch (IllegalArgumentException e) {
                // Se o valor não for válido, deixa como null
                cliente.setGenero(Cliente.Genero.NAO_INFORMADO);
            }
        } else {
            cliente.setGenero(Cliente.Genero.NAO_INFORMADO);
        }
        
        // Hash da senha
        String senhaHash = passwordService.hashPassword(request.getSenha());
        cliente.setSenhaHash(senhaHash);
        
        // Endereço
        cliente.setCep(request.getCep());
        cliente.setLogradouro(request.getLogradouro());
        cliente.setNumero(request.getNumero());
        cliente.setComplemento(request.getComplemento());
        cliente.setBairro(request.getBairro());
        cliente.setCidade(request.getCidade());
        cliente.setEstado(request.getEstado());
        
        return clienteRepository.save(cliente);
    }
    
    public Cliente autenticarCliente(String email, String senha) {
        Optional<Cliente> clienteOpt = clienteRepository.findByEmail(email);
        
        if (clienteOpt.isEmpty()) {
            throw new RuntimeException("Cliente não encontrado");
        }
        
        Cliente cliente = clienteOpt.get();
        
        if (cliente.getStatus() != Cliente.ClienteStatus.ATIVO) {
            throw new RuntimeException("Conta inativa");
        }
        
        if (!passwordService.checkPassword(senha, cliente.getSenhaHash())) {
            throw new RuntimeException("Senha incorreta");
        }
        
        return cliente;
    }
    
    public Cliente buscarPorId(Long id) {
        return clienteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }
    
    public Cliente buscarPorEmail(String email) {
        return clienteRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }
    
    public Cliente atualizarCliente(Long id, ClienteRegistroRequest request) {
        Cliente cliente = buscarPorId(id);
        
        // Verificar se email mudou e se já existe
        if (!cliente.getEmail().equals(request.getEmail()) && 
            clienteRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email já está em uso");
        }
        
        // Validar formato do CPF se mudou
        if (!cliente.getCpf().equals(CPFValidator.cleanCPF(request.getCpf()))) {
            if (!CPFValidator.isValid(request.getCpf())) {
                throw new RuntimeException("CPF inválido");
            }
        }
        
        // Verificar se CPF mudou e se já existe
        String cpfLimpo = CPFValidator.cleanCPF(request.getCpf());
        if (!cliente.getCpf().equals(cpfLimpo) && 
            clienteRepository.existsByCpf(cpfLimpo)) {
            throw new RuntimeException("CPF já está cadastrado");
        }
        
        // Atualizar dados
        cliente.setNome(request.getNome());
        cliente.setEmail(request.getEmail());
        cliente.setCpf(cpfLimpo);
        cliente.setTelefone(request.getTelefone());
        
        // Converter data de nascimento
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            cliente.setDataNascimento(LocalDate.parse(request.getDataNascimento(), formatter));
        } catch (Exception e) {
            throw new RuntimeException("Formato de data inválido. Use yyyy-MM-dd");
        }
        
        // Atualizar gênero se fornecido
        if (request.getGenero() != null && !request.getGenero().isEmpty()) {
            try {
                cliente.setGenero(Cliente.Genero.valueOf(request.getGenero()));
            } catch (IllegalArgumentException e) {
                // Ignora se o valor não for válido
            }
        }
        
        // Atualizar senha se fornecida
        if (request.getSenhaAtual() != null && !request.getSenhaAtual().isEmpty() &&
            request.getNovaSenha() != null && !request.getNovaSenha().isEmpty()) {
            // Verificar se a senha atual está correta
            if (!passwordService.verifyPassword(request.getSenhaAtual(), cliente.getSenhaHash())) {
                throw new RuntimeException("Senha atual incorreta");
            }
            // Atualizar para nova senha
            String senhaHash = passwordService.hashPassword(request.getNovaSenha());
            cliente.setSenhaHash(senhaHash);
        } else if (request.getSenha() != null && !request.getSenha().isEmpty()) {
            // Para compatibilidade com cadastro (sem verificação de senha antiga)
            String senhaHash = passwordService.hashPassword(request.getSenha());
            cliente.setSenhaHash(senhaHash);
        }
        
        // Endereço
        cliente.setCep(request.getCep());
        cliente.setLogradouro(request.getLogradouro());
        cliente.setNumero(request.getNumero());
        cliente.setComplemento(request.getComplemento());
        cliente.setBairro(request.getBairro());
        cliente.setCidade(request.getCidade());
        cliente.setEstado(request.getEstado());
        
        return clienteRepository.save(cliente);
    }
    
    public Cliente atualizarClienteDados(Long id, com.goiashop.dto.ClienteAtualizacaoRequest request) {
        Cliente cliente = buscarPorId(id);
        
        // Atualizar dados básicos (não permite mudar email)
        cliente.setNome(request.getNome());
        cliente.setTelefone(request.getTelefone());
        
        // Converter data de nascimento
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            cliente.setDataNascimento(LocalDate.parse(request.getDataNascimento(), formatter));
        } catch (Exception e) {
            throw new RuntimeException("Formato de data inválido. Use yyyy-MM-dd");
        }
        
        // Atualizar endereço
        cliente.setCep(request.getCep());
        cliente.setLogradouro(request.getLogradouro());
        cliente.setNumero(request.getNumero());
        cliente.setComplemento(request.getComplemento());
        cliente.setBairro(request.getBairro());
        cliente.setCidade(request.getCidade());
        cliente.setEstado(request.getUf());
        
        return clienteRepository.save(cliente);
    }
    
    /**
     * Verifica se já existe um cliente com o CPF informado
     */
    public boolean existsByCpf(String cpf) {
        return clienteRepository.existsByCpf(cpf);
    }
    
    /**
     * Verifica se já existe um cliente com o email informado
     */
    public boolean existsByEmail(String email) {
        return clienteRepository.existsByEmail(email);
    }
}
