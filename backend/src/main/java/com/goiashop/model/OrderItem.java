package com.goiashop.model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Entidade OrderItem - S5-TECH: Item de pedido com snapshot de dados
 * Representa um item individual do pedido com informações do produto no momento da compra
 */
@Entity
@Table(name = "pedido_itens")
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "produto_id", nullable = false)
    @NotNull(message = "ID do produto é obrigatório")
    private Long produtoId;
    
    // Snapshot dos dados do produto no momento da compra
    @Column(name = "name_snapshot", nullable = false, length = 200)
    @NotNull(message = "Nome do produto é obrigatório")
    @Size(min = 1, max = 200, message = "Nome do produto deve ter entre 1 e 200 caracteres")
    private String nameSnapshot;
    
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Preço unitário é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço unitário deve ser maior que zero")
    private BigDecimal unitPrice;
    
    @Column(nullable = false)
    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 1, message = "Quantidade deve ser pelo menos 1")
    private Integer quantity;
    
    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Subtotal é obrigatório")
    @DecimalMin(value = "0.01", message = "Subtotal deve ser maior que zero")
    private BigDecimal subtotal;
    
    @Column(name = "produto_descricao", columnDefinition = "TEXT")
    private String produtoDescricao;
    
    // Relacionamento com Order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    @JsonBackReference
    private Order order;
    
    // Lifecycle callbacks
    @PrePersist
    @PreUpdate
    protected void calculateSubtotal() {
        if (unitPrice != null && quantity != null) {
            this.subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
    
    // Métodos de negócio
    public void updateQuantity(Integer newQuantity) {
        if (newQuantity != null && newQuantity > 0) {
            this.quantity = newQuantity;
            calculateSubtotal();
        }
    }
    
    public void updateUnitPrice(BigDecimal newUnitPrice) {
        if (newUnitPrice != null && newUnitPrice.compareTo(BigDecimal.ZERO) > 0) {
            this.unitPrice = newUnitPrice;
            calculateSubtotal();
        }
    }
    
    // Construtores
    public OrderItem() {}
    
    public OrderItem(Long produtoId, String nameSnapshot, BigDecimal unitPrice, Integer quantity) {
        this.produtoId = produtoId;
        this.nameSnapshot = nameSnapshot;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        if (unitPrice != null && quantity != null) {
            this.subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
    
    public OrderItem(Long produtoId, String nameSnapshot, BigDecimal unitPrice, Integer quantity, String produtoDescricao) {
        this(produtoId, nameSnapshot, unitPrice, quantity);
        this.produtoDescricao = produtoDescricao;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getProdutoId() {
        return produtoId;
    }
    
    public void setProdutoId(Long produtoId) {
        this.produtoId = produtoId;
    }
    
    public String getNameSnapshot() {
        return nameSnapshot;
    }
    
    public void setNameSnapshot(String nameSnapshot) {
        this.nameSnapshot = nameSnapshot;
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        calculateSubtotal();
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        calculateSubtotal();
    }
    
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
    
    public String getProdutoDescricao() {
        return produtoDescricao;
    }
    
    public void setProdutoDescricao(String produtoDescricao) {
        this.produtoDescricao = produtoDescricao;
    }
    
    public Order getOrder() {
        return order;
    }
    
    public void setOrder(Order order) {
        this.order = order;
    }
    
    @Override
    public String toString() {
        return String.format("OrderItem{id=%d, produtoId=%d, nameSnapshot='%s', quantity=%d, unitPrice=%s, subtotal=%s}", 
                           id, produtoId, nameSnapshot, quantity, unitPrice, subtotal);
    }
}