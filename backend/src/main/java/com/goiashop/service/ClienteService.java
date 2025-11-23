package com.goiashop.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.goiashop.dto.ClienteRegistroRequest;
import com.goiashop.model.Cliente;
import com.goiashop.repository.ClienteRepository;
import com.goiashop.util.CPFValidator;

@Service
public class ClienteService {
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private PasswordService passwordService;
    
    @Autowired
    private SecurityLogService securityLogService;
    
    public Cliente registrarCliente(ClienteRegistroRequest request) {
        // Validar nome - deve ter no mínimo duas palavras com pelo menos 3 letras cada
        validarNome(request.getNome());
        
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
        return autenticarCliente(email, senha, null);
    }
    
    public Cliente autenticarCliente(String email, String senha, jakarta.servlet.http.HttpServletRequest request) {
        Optional<Cliente> clienteOpt = clienteRepository.findByEmail(email);
        
        if (clienteOpt.isEmpty()) {
            // Log de tentativa de login com email não encontrado
            if (request != null) {
                securityLogService.registrarLog(null, "LOGIN_FAILED", 
                    "Tentativa de login com email não encontrado: " + email, "FAILED", request);
            }
            throw new RuntimeException("Cliente não encontrado");
        }
        
        Cliente cliente = clienteOpt.get();
        
        if (cliente.getStatus() != Cliente.ClienteStatus.ATIVO) {
            // Log de tentativa de login com conta inativa
            if (request != null) {
                securityLogService.registrarLog(cliente, "LOGIN_FAILED", 
                    "Tentativa de login com conta inativa", "FAILED", request);
            }
            throw new RuntimeException("Conta inativa");
        }
        
        if (!passwordService.checkPassword(senha, cliente.getSenhaHash())) {
            // Log de tentativa de login com senha incorreta
            if (request != null) {
                securityLogService.registrarLog(cliente, "LOGIN_FAILED", 
                    "Tentativa de login com senha incorreta", "FAILED", request);
            }
            throw new RuntimeException("Senha incorreta");
        }
        
        // Log de login bem-sucedido
        if (request != null) {
            securityLogService.registrarLog(cliente, "LOGIN", 
                "Login realizado com sucesso", "SUCCESS", request);
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
        
        // Validar nome - deve ter no mínimo duas palavras com pelo menos 3 letras cada
        validarNome(request.getNome());
        
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
        
        // Validar nome - deve ter no mínimo duas palavras com pelo menos 3 letras cada
        validarNome(request.getNome());
        
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
        
        // Atualizar gênero se fornecido
        if (request.getGenero() != null && !request.getGenero().isEmpty()) {
            try {
                cliente.setGenero(Cliente.Genero.valueOf(request.getGenero()));
            } catch (IllegalArgumentException e) {
                // Ignora se o valor não for válido
            }
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
    
    public Cliente atualizarPerfil(Long id, com.goiashop.dto.ClientePerfilRequest request) {
        Cliente cliente = buscarPorId(id);
        
        // Validar nome - deve ter no mínimo duas palavras com pelo menos 3 letras cada
        validarNome(request.getNome());
        
        // Atualizar dados básicos do perfil
        cliente.setNome(request.getNome());
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
    
    /**
     * Valida se o nome tem pelo menos duas palavras com mínimo 3 letras cada
     */
    private void validarNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            throw new RuntimeException("Nome é obrigatório");
        }
        
        // Dividir o nome em palavras (separadas por espaços)
        String[] palavras = nome.trim().split("\\s+");
        
        // Deve ter pelo menos 2 palavras
        if (palavras.length < 2) {
            throw new RuntimeException("Nome deve ter pelo menos duas palavras");
        }
        
        // Cada palavra deve ter pelo menos 3 letras
        for (String palavra : palavras) {
            if (palavra.length() < 3) {
                throw new RuntimeException("Cada palavra do nome deve ter pelo menos 3 letras");
            }
        }
    }
    
    /**
     * Verificar se a senha fornecida confere com a senha do cliente
     */
    public boolean verificarSenha(Cliente cliente, String senhaFornecida) {
        if (senhaFornecida == null || senhaFornecida.isEmpty()) {
            return false;
        }
        return passwordService.verifyPassword(senhaFornecida, cliente.getSenhaHash());
    }
    
    /**
     * Alterar senha do cliente
     */
    public void alterarSenha(Long clienteId, String novaSenha) {
        Cliente cliente = buscarPorId(clienteId);
        
        // Validar nova senha
        if (novaSenha == null || novaSenha.length() < 6) {
            throw new RuntimeException("Nova senha deve ter pelo menos 6 caracteres");
        }
        
        // Hash da nova senha
        String novaSenhaHash = passwordService.hashPassword(novaSenha);
        
        // Atualizar
        cliente.setSenhaHash(novaSenhaHash);
        clienteRepository.save(cliente);
    }
}
