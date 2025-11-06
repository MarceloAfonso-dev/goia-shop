package com.goiashop.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goiashop.dto.CartItemRequest;
import com.goiashop.dto.PedidoRequest;
import com.goiashop.model.Cliente;
import com.goiashop.model.Pedido;
import com.goiashop.model.PedidoItem;
import com.goiashop.model.Produto;
import com.goiashop.repository.ClienteRepository;
import com.goiashop.repository.PedidoItemRepository;
import com.goiashop.repository.PedidoRepository;
import com.goiashop.repository.ProdutoRepository;

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
    
    @Autowired
    private PagamentoService pagamentoService;
    
    @Autowired
    private EnderecoEntregaService enderecoEntregaService;
    
    @Transactional
    public Pedido criarPedido(Long clienteId, List<CartItemRequest> itensCarrinho, PedidoRequest dadosPedido) {
        // Validar dados de pagamento primeiro
        var resultadoPagamento = pagamentoService.validarPagamento(dadosPedido);
        if (!(Boolean) resultadoPagamento.get("sucesso")) {
            throw new RuntimeException("Erro no pagamento: " + resultadoPagamento.get("mensagem"));
        }
        
        // Buscar cliente
        Cliente cliente = clienteRepository.findById(clienteId)
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        
        // Criar pedido
        Pedido pedido = new Pedido(cliente);
        pedido.setObservacoes(dadosPedido.getObservacoes());
        pedido.setFormaPagamento(dadosPedido.getFormaPagamento());
        
        // Mapear forma de pagamento para o enum ANTES do save
        if (dadosPedido.getFormaPagamento() != null) {
            try {
                switch(dadosPedido.getFormaPagamento().toUpperCase()) {
                    case "PIX":
                        pedido.setPaymentMethod(com.goiashop.model.PaymentMethod.PIX);
                        break;
                    case "BOLETO":
                        pedido.setPaymentMethod(com.goiashop.model.PaymentMethod.BOLETO);
                        break;
                    case "CARTAO":
                        pedido.setPaymentMethod(com.goiashop.model.PaymentMethod.CARTAO);
                        break;
                    case "SALDO_GOIA":
                        pedido.setPaymentMethod(com.goiashop.model.PaymentMethod.SALDO_GOIA);
                        break;
                    default:
                        pedido.setPaymentMethod(com.goiashop.model.PaymentMethod.PIX);
                }
            } catch (Exception e) {
                pedido.setPaymentMethod(com.goiashop.model.PaymentMethod.PIX);
            }
        } else {
            pedido.setPaymentMethod(com.goiashop.model.PaymentMethod.PIX);
        }
        
        // Endereço de entrega
        pedido.setEntregaCep(dadosPedido.getCep());
        pedido.setEntregaLogradouro(dadosPedido.getLogradouro());
        pedido.setEntregaNumero(dadosPedido.getNumero());
        pedido.setEntregaComplemento(dadosPedido.getComplemento());
        pedido.setEntregaBairro(dadosPedido.getBairro());
        pedido.setEntregaCidade(dadosPedido.getCidade());
        pedido.setEntregaEstado(dadosPedido.getEstado());
        
        BigDecimal valorTotal = BigDecimal.ZERO;
        
        // Calcular valores dos itens primeiro
        for (CartItemRequest item : itensCarrinho) {
            Produto produto = produtoRepository.findById(item.getProdutoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + item.getProdutoId()));
            
            // Verificar estoque
            if (produto.getQuantidade() < item.getQuantidade()) {
                throw new RuntimeException("Estoque insuficiente para o produto: " + produto.getNome());
            }
            
            // Calcular valor do item (sem salvar ainda)
            BigDecimal precoItem = produto.getPreco().multiply(BigDecimal.valueOf(item.getQuantidade()));
            valorTotal = valorTotal.add(precoItem);
        }
        
        // Atualizar valores do pedido ANTES de salvar
        pedido.setValorTotal(valorTotal);
        pedido.setItemsTotal(valorTotal);
        pedido.setTotalAmount(valorTotal.add(pedido.getShippingPrice()));
        
        // Agora salvar o pedido com todos os valores corretos
        pedido = pedidoRepository.save(pedido);
        
        // Agora criar e salvar os itens do pedido
        for (CartItemRequest item : itensCarrinho) {
            Produto produto = produtoRepository.findById(item.getProdutoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + item.getProdutoId()));
            
            // Criar item do pedido
            PedidoItem pedidoItem = new PedidoItem(pedido, produto, item.getQuantidade());
            pedidoItemRepository.save(pedidoItem);
            
            // Atualizar estoque do produto
            produto.setQuantidade(produto.getQuantidade() - item.getQuantidade());
            produtoRepository.save(produto);
        }
        
        // Salvar endereço na conta do cliente para reutilização futura
        salvarEnderecoNaContaDoCliente(clienteId, dadosPedido);
        
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
    
    /**
     * Salva o endereço do pedido na conta do cliente para reutilização futura
     */
    private void salvarEnderecoNaContaDoCliente(Long clienteId, PedidoRequest dadosPedido) {
        // Só salvar se há dados de endereço
        if (dadosPedido.getCep() == null || dadosPedido.getLogradouro() == null || 
            dadosPedido.getNumero() == null || dadosPedido.getCidade() == null || 
            dadosPedido.getEstado() == null) {
            return; // Não há dados de endereço suficientes
        }
        
        try {
            // Verificar se o cliente já tem um endereço idêntico
            List<com.goiashop.model.EnderecoEntrega> enderecosExistentes = 
                enderecoEntregaService.listarEnderecosPorCliente(clienteId);
            
            boolean enderecoJaExiste = enderecosExistentes.stream().anyMatch(endereco -> 
                endereco.getCep().equals(dadosPedido.getCep().replaceAll("[^0-9]", "")) &&
                endereco.getLogradouro().equalsIgnoreCase(dadosPedido.getLogradouro()) &&
                endereco.getNumero().equals(dadosPedido.getNumero()) &&
                endereco.getCidade().equalsIgnoreCase(dadosPedido.getCidade())
            );
            
            if (!enderecoJaExiste) {
                // Criar o EnderecoEntregaRequest
                com.goiashop.dto.EnderecoEntregaRequest enderecoRequest = new com.goiashop.dto.EnderecoEntregaRequest();
                enderecoRequest.setCep(dadosPedido.getCep());
                enderecoRequest.setLogradouro(dadosPedido.getLogradouro());
                enderecoRequest.setNumero(dadosPedido.getNumero());
                enderecoRequest.setComplemento(dadosPedido.getComplemento());
                enderecoRequest.setBairro(dadosPedido.getBairro());
                enderecoRequest.setCidade(dadosPedido.getCidade());
                enderecoRequest.setEstado(dadosPedido.getEstado());
                enderecoRequest.setApelido("Endereço do Pedido");
                
                // Salvar o endereço na conta do cliente
                enderecoEntregaService.adicionarEndereco(clienteId, enderecoRequest);
            }
        } catch (Exception e) {
            // Em caso de erro, apenas logar e continuar (não impedir o pedido)
            System.err.println("Erro ao salvar endereço na conta do cliente: " + e.getMessage());
        }
    }
}
