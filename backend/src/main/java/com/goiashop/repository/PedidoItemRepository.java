package com.goiashop.repository;

import com.goiashop.model.PedidoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoItemRepository extends JpaRepository<PedidoItem, Long> {
    
    List<PedidoItem> findByPedidoId(Long pedidoId);
}
