package com.goiashop.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.goiashop.model.Order;
import com.goiashop.model.Order.OrderStatus;

/**
 * Repository para Order - S5-TECH: Consultas e operações de pedidos
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Busca pedidos por cliente
     */
    List<Order> findByClienteIdOrderByCreatedAtDesc(Long clienteId);
    
    /**
     * Busca pedidos por cliente com paginação
     */
    Page<Order> findByClienteId(Long clienteId, Pageable pageable);
    
    /**
     * Busca pedidos por status
     */
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    
    /**
     * Busca pedidos por status com paginação
     */
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    /**
     * Busca pedidos por cliente e status
     */
    List<Order> findByClienteIdAndStatusOrderByCreatedAtDesc(Long clienteId, OrderStatus status);
    
    /**
     * Busca pedidos por período
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Busca pedidos por período com paginação
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    Page<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
    /**
     * Busca pedido por número sequencial
     */
    Optional<Order> findByOrderSequence(Long orderSequence);
    
    /**
     * Verifica se existe pedido com o número sequencial
     */
    boolean existsByOrderSequence(Long orderSequence);
    
    /**
     * Obtém o próximo número sequencial
     */
    @Query("SELECT MAX(o.orderSequence) FROM Order o")
    Optional<Long> findMaxOrderSequence();
    
    /**
     * Busca pedidos pendentes de pagamento há mais de X horas
     */
    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.createdAt < :cutoffTime")
    List<Order> findPendingPaymentOrders(@Param("status") OrderStatus status, @Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Conta pedidos por status
     */
    long countByStatus(OrderStatus status);
    
    /**
     * Conta pedidos por cliente
     */
    long countByClienteId(Long clienteId);
    
    /**
     * Busca pedidos que podem ser cancelados (status específicos)
     */
    @Query("SELECT o FROM Order o WHERE o.status IN ('PENDENTE', 'CONFIRMADO', 'AGUARDANDO_PAGAMENTO') ORDER BY o.createdAt DESC")
    List<Order> findCancellableOrders();
    
    /**
     * Busca pedidos por cliente que podem ser cancelados
     */
    @Query("SELECT o FROM Order o WHERE o.clienteId = :clienteId AND o.status IN ('PENDENTE', 'CONFIRMADO', 'AGUARDANDO_PAGAMENTO') ORDER BY o.createdAt DESC")
    List<Order> findCancellableOrdersByCliente(@Param("clienteId") Long clienteId);
    
    /**
     * Busca pedidos pagos (todos os status de pedidos pagos)
     */
    @Query("SELECT o FROM Order o WHERE o.status IN ('PAGO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE') ORDER BY o.createdAt DESC")
    List<Order> findPaidOrders();
    
    /**
     * Busca pedidos por método de pagamento
     */
    List<Order> findByPaymentMethodOrderByCreatedAtDesc(Order.PaymentMethod paymentMethod);
    
    /**
     * Relatório: Total de vendas por período
     */
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status IN ('PAGO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE') AND o.createdAt BETWEEN :startDate AND :endDate")
    Optional<java.math.BigDecimal> getTotalSalesByPeriod(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Relatório: Contagem de pedidos por período e status
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :startDate AND :endDate")
    long countByStatusAndDateRange(@Param("status") OrderStatus status, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Busca pedidos recentes do cliente (últimos 30 dias)
     */
    @Query("SELECT o FROM Order o WHERE o.clienteId = :clienteId AND o.createdAt >= :sinceDate ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersByCliente(@Param("clienteId") Long clienteId, @Param("sinceDate") LocalDateTime sinceDate);
    
    /**
     * Busca pedidos com itens de um produto específico
     */
    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.produtoId = :produtoId ORDER BY o.createdAt DESC")
    List<Order> findOrdersWithProduct(@Param("produtoId") Long produtoId);
}