package com.goiashop.repository;

import com.goiashop.model.Pedido;
import com.goiashop.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    List<Pedido> findByClienteOrderByCreatedAtDesc(Cliente cliente);
    
    List<Pedido> findByClienteIdOrderByCreatedAtDesc(Long clienteId);
    
    Optional<Pedido> findByNumeroPedido(String numeroPedido);
    
    @Query("SELECT p FROM Pedido p WHERE p.cliente.id = :clienteId AND p.status = :status ORDER BY p.createdAt DESC")
    List<Pedido> findByClienteIdAndStatus(@Param("clienteId") Long clienteId, @Param("status") Pedido.PedidoStatus status);
    
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.cliente.id = :clienteId")
    Long countByClienteId(@Param("clienteId") Long clienteId);
}
