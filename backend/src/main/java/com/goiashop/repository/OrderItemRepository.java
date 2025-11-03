package com.goiashop.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.goiashop.model.OrderItem;

/**
 * Repository para OrderItem - S5-TECH: Consultas e operações de itens de pedido
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    /**
     * Busca itens por pedido
     */
    List<OrderItem> findByOrderId(Long orderId);
    
    /**
     * Busca itens por produto
     */
    List<OrderItem> findByProdutoId(Long produtoId);
    
    /**
     * Busca itens por produto em um período específico
     */
    @Query("SELECT oi FROM OrderItem oi JOIN oi.order o WHERE oi.produtoId = :produtoId AND o.createdAt BETWEEN :startDate AND :endDate")
    List<OrderItem> findByProdutoIdAndDateRange(@Param("produtoId") Long produtoId, 
                                               @Param("startDate") LocalDateTime startDate, 
                                               @Param("endDate") LocalDateTime endDate);
    
    /**
     * Calcula quantidade total vendida de um produto
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi JOIN oi.order o WHERE oi.produtoId = :produtoId AND o.status IN ('PAGO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE')")
    Long getTotalQuantitySoldByProduct(@Param("produtoId") Long produtoId);
    
    /**
     * Calcula quantidade total vendida de um produto em período
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi JOIN oi.order o WHERE oi.produtoId = :produtoId AND o.status IN ('PAGO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE') AND o.createdAt BETWEEN :startDate AND :endDate")
    Long getTotalQuantitySoldByProductAndPeriod(@Param("produtoId") Long produtoId, 
                                              @Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate);
    
    /**
     * Calcula receita total de um produto
     */
    @Query("SELECT COALESCE(SUM(oi.subtotal), 0) FROM OrderItem oi JOIN oi.order o WHERE oi.produtoId = :produtoId AND o.status IN ('PAGO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE')")
    java.math.BigDecimal getTotalRevenueByProduct(@Param("produtoId") Long produtoId);
    
    /**
     * Busca produtos mais vendidos (por quantidade)
     */
    @Query("SELECT oi.produtoId, oi.nameSnapshot, SUM(oi.quantity) as totalQty FROM OrderItem oi JOIN oi.order o WHERE o.status IN ('PAGO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE') GROUP BY oi.produtoId, oi.nameSnapshot ORDER BY totalQty DESC")
    List<Object[]> findBestSellingProductsByQuantity();
    
    /**
     * Busca produtos mais vendidos (por receita)
     */
    @Query("SELECT oi.produtoId, oi.nameSnapshot, SUM(oi.subtotal) as totalRevenue FROM OrderItem oi JOIN oi.order o WHERE o.status IN ('PAGO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE') GROUP BY oi.produtoId, oi.nameSnapshot ORDER BY totalRevenue DESC")
    List<Object[]> findBestSellingProductsByRevenue();
    
    /**
     * Busca produtos mais vendidos em um período (por quantidade)
     */
    @Query("SELECT oi.produtoId, oi.nameSnapshot, SUM(oi.quantity) as totalQty FROM OrderItem oi JOIN oi.order o WHERE o.status IN ('PAGO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE') AND o.createdAt BETWEEN :startDate AND :endDate GROUP BY oi.produtoId, oi.nameSnapshot ORDER BY totalQty DESC")
    List<Object[]> findBestSellingProductsByQuantityAndPeriod(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Conta quantos pedidos diferentes contêm um produto
     */
    @Query("SELECT COUNT(DISTINCT oi.order.id) FROM OrderItem oi WHERE oi.produtoId = :produtoId")
    Long countDistinctOrdersByProduct(@Param("produtoId") Long produtoId);
    
    /**
     * Busca itens de pedidos de um cliente específico
     */
    @Query("SELECT oi FROM OrderItem oi JOIN oi.order o WHERE o.clienteId = :clienteId ORDER BY o.createdAt DESC")
    List<OrderItem> findByClienteId(@Param("clienteId") Long clienteId);
    
    /**
     * Busca histórico de preços de um produto (snapshots únicos)
     */
    @Query("SELECT DISTINCT oi.unitPrice, MIN(o.createdAt) as firstSale FROM OrderItem oi JOIN oi.order o WHERE oi.produtoId = :produtoId GROUP BY oi.unitPrice ORDER BY firstSale DESC")
    List<Object[]> findPriceHistoryByProduct(@Param("produtoId") Long produtoId);
    
    /**
     * Verifica se um produto já foi vendido
     */
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi JOIN oi.order o WHERE oi.produtoId = :produtoId AND o.status IN ('PAGO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE')")
    boolean hasBeenSold(@Param("produtoId") Long produtoId);
    
    /**
     * Busca itens para relatório de vendas por período
     */
    @Query("SELECT oi FROM OrderItem oi JOIN oi.order o WHERE o.status IN ('PAGO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE') AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<OrderItem> findSoldItemsByPeriod(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Calcula ticket médio por produto
     */
    @Query("SELECT AVG(oi.subtotal) FROM OrderItem oi JOIN oi.order o WHERE oi.produtoId = :produtoId AND o.status IN ('PAGO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE')")
    java.math.BigDecimal getAverageItemValue(@Param("produtoId") Long produtoId);
}