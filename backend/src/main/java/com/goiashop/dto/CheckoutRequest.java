package com.goiashop.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para request de checkout - S5-TECH
 */
public class CheckoutRequest {
    
    @NotNull(message = "ID do cliente é obrigatório")
    private Long clienteId;
    
    @NotNull(message = "Lista de itens é obrigatória")
    @Size(min = 1, message = "Deve haver pelo menos um item")
    private List<CartItem> itens;
    
    @NotNull(message = "Subtotal dos itens é obrigatório")
    @DecimalMin(value = "0.01", message = "Subtotal deve ser maior que zero")
    private BigDecimal subtotalItens;
    
    @NotNull(message = "Preço do frete é obrigatório")
    @DecimalMin(value = "0.00", message = "Preço do frete não pode ser negativo")
    private BigDecimal precoFrete;
    
    @NotNull(message = "Endereço de entrega é obrigatório")
    private EnderecoEntregaDTO enderecoEntrega;
    
    @NotNull(message = "Método de pagamento é obrigatório")
    private String metodoPagamento;
    
    private String infoPagamento; // JSON com informações específicas do método
    
    private String servicoFrete;
    private Integer prazoEntrega;
    
    // Construtores
    public CheckoutRequest() {}
    
    // Getters e Setters
    public Long getClienteId() {
        return clienteId;
    }
    
    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }
    
    public List<CartItem> getItens() {
        return itens;
    }
    
    public void setItens(List<CartItem> itens) {
        this.itens = itens;
    }
    
    public BigDecimal getSubtotalItens() {
        return subtotalItens;
    }
    
    public void setSubtotalItens(BigDecimal subtotalItens) {
        this.subtotalItens = subtotalItens;
    }
    
    public BigDecimal getPrecoFrete() {
        return precoFrete;
    }
    
    public void setPrecoFrete(BigDecimal precoFrete) {
        this.precoFrete = precoFrete;
    }
    
    public EnderecoEntregaDTO getEnderecoEntrega() {
        return enderecoEntrega;
    }
    
    public void setEnderecoEntrega(EnderecoEntregaDTO enderecoEntrega) {
        this.enderecoEntrega = enderecoEntrega;
    }
    
    public String getMetodoPagamento() {
        return metodoPagamento;
    }
    
    public void setMetodoPagamento(String metodoPagamento) {
        this.metodoPagamento = metodoPagamento;
    }
    
    public String getInfoPagamento() {
        return infoPagamento;
    }
    
    public void setInfoPagamento(String infoPagamento) {
        this.infoPagamento = infoPagamento;
    }
    
    public String getServicoFrete() {
        return servicoFrete;
    }
    
    public void setServicoFrete(String servicoFrete) {
        this.servicoFrete = servicoFrete;
    }
    
    public Integer getPrazoEntrega() {
        return prazoEntrega;
    }
    
    public void setPrazoEntrega(Integer prazoEntrega) {
        this.prazoEntrega = prazoEntrega;
    }
}