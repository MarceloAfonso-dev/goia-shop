package com.goiashop.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goiashop.dto.CartItem;
import com.goiashop.dto.CheckoutRequest;
import com.goiashop.model.Order;
import com.goiashop.model.OrderItem;
import com.goiashop.model.Produto;
import com.goiashop.repository.OrderRepository;
import com.goiashop.repository.ProdutoRepository;

/**
 * Serviço Order - S5-TECH: Regras de negócio para pedidos
 * Implementa todas as operações relacionadas a pedidos com validações e regras de negócio
 */
@Service
@Transactional
public class OrderService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProdutoRepository produtoRepository;
    
    @Autowired
    private EstoqueMovimentoService estoqueService;
    
    @Autowired
    private OrderAuditService auditService;
    
    /**
     * Cria um novo pedido a partir de um checkout
     * S5-TECH: Validação de estoque, geração de número, debitar estoque
     */
    public Order createOrder(CheckoutRequest checkoutRequest) {
        logger.info("Iniciando criação de pedido para cliente {}", checkoutRequest.getClienteId());
        
        try {
            // 1. Validar estoque de todos os itens
            validateStock(checkoutRequest.getItens());
            
            // 2. Criar o pedido
            Order order = buildOrderFromCheckout(checkoutRequest);
            
            // 3. Gerar número sequencial único
            order.setOrderSequence(generateOrderSequence());
            
            // 4. Salvar o pedido (cascade salvará os itens)
            order = orderRepository.save(order);
            
            // 5. Debitar estoque
            debitStock(order);
            
            // 6. Registrar auditoria
            auditService.logOrderCreated(order);
            
            logger.info("Pedido {} criado com sucesso", order.getFormattedOrderNumber());
            return order;
            
        } catch (Exception e) {
            logger.error("Erro ao criar pedido para cliente {}: {}", checkoutRequest.getClienteId(), e.getMessage());
            throw new RuntimeException("Erro ao criar pedido: " + e.getMessage(), e);
        }
    }
    
    /**
     * Valida se há estoque suficiente para todos os itens
     */
    private void validateStock(List<CartItem> cartItems) {
        for (CartItem item : cartItems) {
            Produto produto = produtoRepository.findById(item.getProdutoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + item.getProdutoId()));
            
            if (produto.getQuantidadeEstoque() < item.getQuantidade()) {
                throw new RuntimeException(String.format(
                    "Estoque insuficiente para o produto '%s'. Disponível: %d, Solicitado: %d", 
                    produto.getNome(), produto.getQuantidadeEstoque(), item.getQuantidade()));
            }
            
            if (produto.getStatus() != Produto.ProdutoStatus.ATIVO) {
                throw new RuntimeException(String.format(
                    "Produto '%s' não está ativo e não pode ser vendido", produto.getNome()));
            }
        }
    }
    
    /**
     * Constrói o objeto Order a partir do CheckoutRequest
     */
    private Order buildOrderFromCheckout(CheckoutRequest checkoutRequest) {
        Order order = new Order();
        
        // Dados básicos
        order.setClienteId(checkoutRequest.getClienteId());
        order.setStatus(Order.OrderStatus.AGUARDANDO_PAGAMENTO);
        
        // Valores monetários
        order.setItemsTotal(checkoutRequest.getSubtotalItens());
        order.setShippingPrice(checkoutRequest.getPrecoFrete());
        // totalAmount será calculado automaticamente no @PrePersist
        
        // Endereço (snapshot)
        if (checkoutRequest.getEnderecoEntrega() != null) {
            order.setEnderecoEntregaId(checkoutRequest.getEnderecoEntrega().getId());
            order.setEnderecoCep(checkoutRequest.getEnderecoEntrega().getCep());
            order.setEnderecoLogradouro(checkoutRequest.getEnderecoEntrega().getLogradouro());
            order.setEnderecoNumero(checkoutRequest.getEnderecoEntrega().getNumero());
            order.setEnderecoComplemento(checkoutRequest.getEnderecoEntrega().getComplemento());
            order.setEnderecoBairro(checkoutRequest.getEnderecoEntrega().getBairro());
            order.setEnderecoCidade(checkoutRequest.getEnderecoEntrega().getCidade());
            order.setEnderecoEstado(checkoutRequest.getEnderecoEntrega().getEstado());
        }
        
        // Pagamento
        order.setPaymentMethod(Order.PaymentMethod.valueOf(checkoutRequest.getMetodoPagamento()));
        order.setPaymentInfo(checkoutRequest.getInfoPagamento());
        
        // Frete
        order.setShippingService(checkoutRequest.getServicoFrete());
        order.setShippingDeadline(checkoutRequest.getPrazoEntrega());
        
        // Itens
        for (CartItem cartItem : checkoutRequest.getItens()) {
            Produto produto = produtoRepository.findById(cartItem.getProdutoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + cartItem.getProdutoId()));
            
            OrderItem orderItem = new OrderItem(
                produto.getId(),
                produto.getNome(),      // snapshot do nome
                produto.getPreco(),     // snapshot do preço
                cartItem.getQuantidade(),
                produto.getDescricao()  // snapshot da descrição
            );
            
            order.addItem(orderItem);
        }
        
        return order;
    }
    
    /**
     * Gera o próximo número sequencial único para o pedido
     */
    private Long generateOrderSequence() {
        Optional<Long> maxSequence = orderRepository.findMaxOrderSequence();
        return maxSequence.orElse(0L) + 1L;
    }
    
    /**
     * Debita o estoque de todos os produtos do pedido
     */
    private void debitStock(Order order) {
        for (OrderItem item : order.getItems()) {
            estoqueService.debitStock(
                item.getProdutoId(), 
                item.getQuantity(), 
                order.getId(),
                "Venda - Pedido " + order.getFormattedOrderNumber()
            );
        }
    }
    
    /**
     * Busca pedido por ID
     */
    @Transactional(readOnly = true)
    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id);
    }
    
    /**
     * Busca pedido por número sequencial
     */
    @Transactional(readOnly = true)
    public Optional<Order> findByOrderNumber(Long orderSequence) {
        return orderRepository.findByOrderSequence(orderSequence);
    }
    
    /**
     * Lista pedidos do cliente
     */
    @Transactional(readOnly = true)
    public List<Order> findOrdersByCliente(Long clienteId) {
        return orderRepository.findByClienteIdOrderByCreatedAtDesc(clienteId);
    }
    
    /**
     * Lista pedidos do cliente com paginação
     */
    @Transactional(readOnly = true)
    public Page<Order> findOrdersByCliente(Long clienteId, Pageable pageable) {
        return orderRepository.findByClienteId(clienteId, pageable);
    }
    
    /**
     * Lista pedidos por status
     */
    @Transactional(readOnly = true)
    public List<Order> findOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    /**
     * Atualiza status do pedido com auditoria
     */
    public Order updateOrderStatus(Long orderId, Order.OrderStatus newStatus, String motivo) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Pedido não encontrado: " + orderId));
        
        Order.OrderStatus oldStatus = order.getStatus();
        
        // Validar transição de status
        validateStatusTransition(oldStatus, newStatus);
        
        // Atualizar status
        order.setStatus(newStatus);
        order = orderRepository.save(order);
        
        // Registrar auditoria
        auditService.logStatusChange(order, oldStatus, newStatus, motivo);
        
        // Processar ações específicas do status
        handleStatusActions(order, newStatus);
        
        logger.info("Status do pedido {} alterado de {} para {}", 
                   order.getFormattedOrderNumber(), oldStatus, newStatus);
        
        return order;
    }
    
    /**
     * Valida se a transição de status é permitida
     */
    private void validateStatusTransition(Order.OrderStatus from, Order.OrderStatus to) {
        // Regras básicas de transição
        if (from == Order.OrderStatus.CANCELADO || from == Order.OrderStatus.DEVOLVIDO) {
            throw new RuntimeException("Não é possível alterar status de pedido cancelado ou devolvido");
        }
        
        if (from == Order.OrderStatus.ENTREGUE && to != Order.OrderStatus.DEVOLVIDO) {
            throw new RuntimeException("Pedido entregue só pode ser devolvido");
        }
        
        // Outras validações específicas podem ser adicionadas aqui
    }
    
    /**
     * Executa ações específicas baseadas no novo status
     */
    private void handleStatusActions(Order order, Order.OrderStatus newStatus) {
        switch (newStatus) {
            case CANCELADO -> {
                // Estornar estoque
                restoreStock(order);
            }
            case PAGO -> {
                // Confirmar pagamento, enviar email, etc.
                logger.info("Pedido {} pago - processando confirmação", order.getFormattedOrderNumber());
            }
            case ENVIADO -> {
                // Gerar código de rastreamento, enviar email, etc.
                logger.info("Pedido {} enviado", order.getFormattedOrderNumber());
            }
            default -> {
                // Nenhuma ação específica
            }
        }
    }
    
    /**
     * Restaura estoque quando pedido é cancelado
     */
    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            estoqueService.restoreStock(
                item.getProdutoId(),
                item.getQuantity(),
                order.getId(),
                "Cancelamento - Pedido " + order.getFormattedOrderNumber()
            );
        }
    }
    
    /**
     * Cancela pedido (se permitido)
     */
    public Order cancelOrder(Long orderId, String motivo) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Pedido não encontrado: " + orderId));
        
        if (!order.canBeCancelled()) {
            throw new RuntimeException("Pedido não pode ser cancelado no status atual: " + order.getStatus());
        }
        
        return updateOrderStatus(orderId, Order.OrderStatus.CANCELADO, motivo);
    }
    
    /**
     * Busca pedidos recentes do cliente
     */
    @Transactional(readOnly = true)
    public List<Order> findRecentOrdersByCliente(Long clienteId, int days) {
        LocalDateTime sinceDate = LocalDateTime.now().minusDays(days);
        return orderRepository.findRecentOrdersByCliente(clienteId, sinceDate);
    }
    
    /**
     * Relatório: Total de vendas por período
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalSalesByPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.getTotalSalesByPeriod(startDate, endDate)
                .orElse(BigDecimal.ZERO);
    }
    
    /**
     * Busca pedidos que precisam de atenção (pagamento pendente há muito tempo)
     */
    @Transactional(readOnly = true)
    public List<Order> findOrdersNeedingAttention(int hoursLimit) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(hoursLimit);
        return orderRepository.findPendingPaymentOrders(Order.OrderStatus.AGUARDANDO_PAGAMENTO, cutoffTime);
    }
}