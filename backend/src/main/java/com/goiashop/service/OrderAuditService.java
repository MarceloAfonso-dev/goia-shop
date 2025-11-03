package com.goiashop.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goiashop.model.Order;

/**
 * Serviço para auditoria de pedidos - S5-TECH
 * Registra todas as alterações e eventos importantes dos pedidos
 */
@Service
@Transactional
public class OrderAuditService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderAuditService.class);
    
    /**
     * Registra criação de pedido
     */
    public void logOrderCreated(Order order) {
        // TODO: Salvar na tabela pedido_audit quando implementada
        logger.info("AUDIT: Pedido {} criado | Cliente: {} | Status: {} | Valor: {}", 
                   order.getFormattedOrderNumber(), order.getClienteId(), 
                   order.getStatus(), order.getTotalAmount());
    }
    
    /**
     * Registra mudança de status
     */
    public void logStatusChange(Order order, Order.OrderStatus statusAnterior, 
                               Order.OrderStatus statusNovo, String motivo) {
        // TODO: Salvar na tabela pedido_audit quando implementada
        logger.info("AUDIT: Pedido {} | Status alterado de {} para {} | Motivo: {}", 
                   order.getFormattedOrderNumber(), statusAnterior, statusNovo, 
                   motivo != null ? motivo : "Não informado");
    }
    
    /**
     * Registra cancelamento
     */
    public void logOrderCancelled(Order order, String motivo) {
        // TODO: Salvar na tabela pedido_audit quando implementada
        logger.info("AUDIT: Pedido {} cancelado | Motivo: {}", 
                   order.getFormattedOrderNumber(), motivo != null ? motivo : "Não informado");
    }
}