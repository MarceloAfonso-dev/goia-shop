package com.goiashop.service;

import com.goiashop.dto.CartItemRequest;
import com.goiashop.dto.PedidoRequest;
import com.goiashop.model.*;
import com.goiashop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PedidoService {
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private PedidoItemRepository pedidoItemRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private ProdutoRepository produtoRepository;
    
    @Transactional
    public Pedido criarPedido(Long clienteId, List<CartItemRequest> itensCarrinho, PedidoRequest dadosPedido) {
        // Buscar cliente
        Cliente cliente = clienteRepository.findById(clienteId)
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        
        // Criar pedido
        Pedido pedido = new Pedido(cliente);
        pedido.setObservacoes(dadosPedido.getObservacoes());
        pedido.setFormaPagamento(dadosPedido.getFormaPagamento());
        
        // Endereço de entrega
        pedido.setEntregaCep(dadosPedido.getCep());
        pedido.setEntregaLogradouro(dadosPedido.getLogradouro());
        pedido.setEntregaNumero(dadosPedido.getNumero());
        pedido.setEntregaComplemento(dadosPedido.getComplemento());
        pedido.setEntregaBairro(dadosPedido.getBairro());
        pedido.setEntregaCidade(dadosPedido.getCidade());
        pedido.setEntregaEstado(dadosPedido.getEstado());
        
        // Salvar pedido primeiro para obter ID
        pedido = pedidoRepository.save(pedido);
        
        BigDecimal valorTotal = BigDecimal.ZERO;
        
        // Adicionar itens
        for (CartItemRequest item : itensCarrinho) {
            Produto produto = produtoRepository.findById(item.getProdutoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + item.getProdutoId()));
            
            // Verificar estoque
            if (produto.getQuantidade() < item.getQuantidade()) {
                throw new RuntimeException("Estoque insuficiente para o produto: " + produto.getNome());
            }
            
            // Criar item do pedido
            PedidoItem pedidoItem = new PedidoItem(pedido, produto, item.getQuantidade());
            pedidoItemRepository.save(pedidoItem);
            
            // Atualizar estoque do produto
            produto.setQuantidade(produto.getQuantidade() - item.getQuantidade());
            produtoRepository.save(produto);
            
            valorTotal = valorTotal.add(pedidoItem.getPrecoTotal());
        }
        
        // Atualizar valor total do pedido
        pedido.setValorTotal(valorTotal);
        pedido = pedidoRepository.save(pedido);
        
        return pedido;
    }
    
    public List<Pedido> listarPedidosCliente(Long clienteId) {
        return pedidoRepository.findByClienteIdOrderByCreatedAtDesc(clienteId);
    }
    
    public Pedido buscarPedido(Long pedidoId, Long clienteId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        if (!pedido.getCliente().getId().equals(clienteId)) {
            throw new RuntimeException("Pedido não pertence ao cliente");
        }
        
        return pedido;
    }
    
    public Pedido buscarPedidoPorNumero(String numeroPedido) {
        return pedidoRepository.findByNumeroPedido(numeroPedido)
            .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
    }
    
    public Pedido atualizarStatus(Long pedidoId, Pedido.PedidoStatus novoStatus) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        pedido.setStatus(novoStatus);
        return pedidoRepository.save(pedido);
    }
    
    @Transactional
    public void cancelarPedido(Long pedidoId, Long clienteId) {
        Pedido pedido = buscarPedido(pedidoId, clienteId);
        
        // Só pode cancelar se estiver pendente ou confirmado
        if (pedido.getStatus() != Pedido.PedidoStatus.PENDENTE && 
            pedido.getStatus() != Pedido.PedidoStatus.CONFIRMADO) {
            throw new RuntimeException("Pedido não pode ser cancelado no status atual");
        }
        
        // Devolver estoque
        List<PedidoItem> itens = pedidoItemRepository.findByPedidoId(pedidoId);
        for (PedidoItem item : itens) {
            Produto produto = item.getProduto();
            produto.setQuantidade(produto.getQuantidade() + item.getQuantidade());
            produtoRepository.save(produto);
        }
        
        // Atualizar status
        pedido.setStatus(Pedido.PedidoStatus.CANCELADO);
        pedidoRepository.save(pedido);
    }
    
    public Long contarPedidosCliente(Long clienteId) {
        return pedidoRepository.countByClienteId(clienteId);
    }
}
