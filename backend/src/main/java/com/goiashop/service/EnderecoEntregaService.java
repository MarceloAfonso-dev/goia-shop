package com.goiashop.service;

import com.goiashop.dto.EnderecoEntregaRequest;
import com.goiashop.model.Cliente;
import com.goiashop.model.EnderecoEntrega;
import com.goiashop.repository.ClienteRepository;
import com.goiashop.repository.EnderecoEntregaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EnderecoEntregaService {
    
    @Autowired
    private EnderecoEntregaRepository enderecoRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    /**
     * Listar todos os endereços de um cliente
     */
    public List<EnderecoEntrega> listarEnderecosPorCliente(Long clienteId) {
        return enderecoRepository.findByClienteIdOrderByIsPadraoDescCreatedAtAsc(clienteId);
    }
    
    /**
     * Buscar endereço padrão de um cliente
     */
    public Optional<EnderecoEntrega> buscarEnderecoPadrao(Long clienteId) {
        return enderecoRepository.findByClienteIdAndIsPadraoTrue(clienteId);
    }
    
    /**
     * Buscar endereço por ID (validando que pertence ao cliente)
     */
    public EnderecoEntrega buscarEnderecoPorId(Long enderecoId, Long clienteId) {
        return enderecoRepository.findByIdAndClienteId(enderecoId, clienteId)
            .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));
    }
    
    /**
     * Adicionar novo endereço
     */
    @Transactional
    public EnderecoEntrega adicionarEndereco(Long clienteId, EnderecoEntregaRequest request) {
        Cliente cliente = clienteRepository.findById(clienteId)
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        
        // Validar e limpar dados
        String cepLimpo = request.getCep().replaceAll("[^0-9]", "");
        if (cepLimpo.length() != 8) {
            throw new RuntimeException("CEP inválido. Deve conter 8 dígitos.");
        }
        
        String estadoLimpo = request.getEstado() != null ? request.getEstado().toUpperCase().trim() : "";
        if (estadoLimpo.length() != 2) {
            throw new RuntimeException("Estado inválido. Deve conter 2 caracteres.");
        }
        
        // Contar endereços existentes
        long quantidadeEnderecos = enderecoRepository.countByClienteId(clienteId);
        
        // Criar novo endereço
        EnderecoEntrega novoEndereco = new EnderecoEntrega();
        novoEndereco.setCliente(cliente);
        novoEndereco.setCep(cepLimpo);
        novoEndereco.setLogradouro(request.getLogradouro());
        novoEndereco.setNumero(request.getNumero());
        novoEndereco.setComplemento(request.getComplemento());
        novoEndereco.setBairro(request.getBairro());
        novoEndereco.setCidade(request.getCidade());
        novoEndereco.setEstado(estadoLimpo);
        novoEndereco.setApelido(request.getApelido());
        
        // Se for o primeiro endereço, definir como padrão automaticamente
        if (quantidadeEnderecos == 0) {
            novoEndereco.setIsPadrao(true);
        } else {
            // Se isPadrao for true e já houver endereços, remover o padrão anterior
            if (request.getIsPadrao() != null && request.getIsPadrao()) {
                removerEnderecoPadrao(clienteId);
                novoEndereco.setIsPadrao(true);
            } else {
                novoEndereco.setIsPadrao(false);
            }
        }
        
        return enderecoRepository.save(novoEndereco);
    }
    
    /**
     * Atualizar endereço existente
     */
    @Transactional
    public EnderecoEntrega atualizarEndereco(Long enderecoId, Long clienteId, EnderecoEntregaRequest request) {
        EnderecoEntrega endereco = buscarEnderecoPorId(enderecoId, clienteId);
        
        // Validar e limpar dados
        String cepLimpo = request.getCep().replaceAll("[^0-9]", "");
        if (cepLimpo.length() != 8) {
            throw new RuntimeException("CEP inválido. Deve conter 8 dígitos.");
        }
        
        String estadoLimpo = request.getEstado() != null ? request.getEstado().toUpperCase().trim() : "";
        if (estadoLimpo.length() != 2) {
            throw new RuntimeException("Estado inválido. Deve conter 2 caracteres.");
        }
        
        // Atualizar dados
        endereco.setCep(cepLimpo);
        endereco.setLogradouro(request.getLogradouro());
        endereco.setNumero(request.getNumero());
        endereco.setComplemento(request.getComplemento());
        endereco.setBairro(request.getBairro());
        endereco.setCidade(request.getCidade());
        endereco.setEstado(estadoLimpo);
        endereco.setApelido(request.getApelido());
        
        // Se isPadrao for true, remover o padrão anterior
        if (request.getIsPadrao() != null && request.getIsPadrao() && !endereco.getIsPadrao()) {
            removerEnderecoPadrao(clienteId);
            endereco.setIsPadrao(true);
        }
        
        return enderecoRepository.save(endereco);
    }
    
    /**
     * Definir endereço como padrão
     */
    @Transactional
    public EnderecoEntrega definirEnderecoPadrao(Long enderecoId, Long clienteId) {
        EnderecoEntrega endereco = buscarEnderecoPorId(enderecoId, clienteId);
        
        // Remover padrão de todos os outros endereços
        removerEnderecoPadrao(clienteId);
        
        // Definir este como padrão
        endereco.setIsPadrao(true);
        return enderecoRepository.save(endereco);
    }
    
    /**
     * Remover endereço
     */
    @Transactional
    public void removerEndereco(Long enderecoId, Long clienteId) {
        EnderecoEntrega endereco = buscarEnderecoPorId(enderecoId, clienteId);
        
        boolean eraPadrao = endereco.getIsPadrao();
        
        // Verificar se não é o único endereço (opcional - dependendo da regra de negócio)
        long quantidadeEnderecos = enderecoRepository.countByClienteId(clienteId);
        
        enderecoRepository.delete(endereco);
        
        // Se era o endereço padrão e há outros endereços, definir o primeiro como padrão
        if (eraPadrao && quantidadeEnderecos > 1) {
            List<EnderecoEntrega> enderecos = listarEnderecosPorCliente(clienteId);
            if (!enderecos.isEmpty()) {
                EnderecoEntrega proximoEndereco = enderecos.get(0);
                proximoEndereco.setIsPadrao(true);
                enderecoRepository.save(proximoEndereco);
            }
        }
    }
    
    /**
     * Remove o flag de padrão de todos os endereços de um cliente
     */
    private void removerEnderecoPadrao(Long clienteId) {
        Optional<EnderecoEntrega> enderecoPadrao = buscarEnderecoPadrao(clienteId);
        if (enderecoPadrao.isPresent()) {
            EnderecoEntrega endereco = enderecoPadrao.get();
            endereco.setIsPadrao(false);
            enderecoRepository.save(endereco);
        }
    }
}
