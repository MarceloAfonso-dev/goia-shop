package com.goiashop.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/**
 * Entidade Order - S5-TECH: Modelagem e regras do pedido (suporte)
 * Representa um pedido completo com todas as informações necessárias
 */
@Entity
@Table(name = "pedidos")
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_sequence", nullable = false, unique = true)
    private Long orderSequence;
    
    @Column(name = "cliente_id", nullable = false)
    @NotNull(message = "ID do cliente é obrigatório")
    private Long clienteId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDENTE;
    
    // Valores monetários
    @Column(name = "items_total", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Total dos itens é obrigatório")
    @DecimalMin(value = "0.01", message = "Total dos itens deve ser maior que zero")
    private BigDecimal itemsTotal;
    
    @Column(name = "shipping_price", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Preço do frete é obrigatório")
    @DecimalMin(value = "0.00", message = "Preço do frete não pode ser negativo")
    private BigDecimal shippingPrice;
    
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Valor total é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor total deve ser maior que zero")
    private BigDecimal totalAmount;
    
    // Endereço de entrega
    @Column(name = "endereco_entrega_id")
    private Long enderecoEntregaId;
    
    // Informações de endereço snapshot
    @Column(name = "endereco_cep", length = 8)
    private String enderecoCep;
    
    @Column(name = "endereco_logradouro", length = 200)
    private String enderecoLogradouro;
    
    @Column(name = "endereco_numero", length = 10)
    private String enderecoNumero;
    
    @Column(name = "endereco_complemento", length = 100)
    private String enderecoComplemento;
    
    @Column(name = "endereco_bairro", length = 100)
    private String enderecoBairro;
    
    @Column(name = "endereco_cidade", length = 100)
    private String enderecoCidade;
    
    @Column(name = "endereco_estado", length = 2)
    private String enderecoEstado;
    
    // Informações de pagamento
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    @NotNull(message = "Método de pagamento é obrigatório")
    private PaymentMethod paymentMethod;
    
    @Column(name = "payment_info", columnDefinition = "JSON")
    private String paymentInfo;
    
    // Informações de frete
    @Column(name = "shipping_service", length = 100)
    private String shippingService;
    
    @Column(name = "shipping_deadline")
    private Integer shippingDeadline;
    
    // Auditoria
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relacionamentos
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference
    private List<OrderItem> items = new ArrayList<>();
    
    // Enums
    public enum OrderStatus {
        PENDENTE("Pendente"),
        CONFIRMADO("Confirmado"), 
        AGUARDANDO_PAGAMENTO("Aguardando Pagamento"),
        PAGO("Pago"),
        PROCESSANDO("Processando"),
        ENVIADO("Enviado"),
        ENTREGUE("Entregue"),
        CANCELADO("Cancelado"),
        DEVOLVIDO("Devolvido");
        
        private final String displayName;
        
        OrderStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum PaymentMethod {
        PIX("PIX"),
        BOLETO("Boleto Bancário"),
        CARTAO("Cartão de Crédito"),
        SALDO_GOIA("Saldo GoiaShop");
        
        private final String displayName;
        
        PaymentMethod(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        calculateTotalAmount();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateTotalAmount();
    }
    
    // Métodos de negócio
    private void calculateTotalAmount() {
        if (itemsTotal != null && shippingPrice != null) {
            this.totalAmount = itemsTotal.add(shippingPrice);
        }
    }
    
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
    
    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
    
    public String getFormattedOrderNumber() {
        return String.format("GS%08d", orderSequence != null ? orderSequence : 0L);
    }
    
    public boolean canBeCancelled() {
        return status == OrderStatus.PENDENTE || 
               status == OrderStatus.CONFIRMADO || 
               status == OrderStatus.AGUARDANDO_PAGAMENTO;
    }
    
    public boolean isPaid() {
        return status == OrderStatus.PAGO || 
               status == OrderStatus.PROCESSANDO || 
               status == OrderStatus.ENVIADO || 
               status == OrderStatus.ENTREGUE;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getOrderSequence() {
        return orderSequence;
    }
    
    public void setOrderSequence(Long orderSequence) {
        this.orderSequence = orderSequence;
    }
    
    public Long getClienteId() {
        return clienteId;
    }
    
    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }
    
    public OrderStatus getStatus() {
        return status;
    }
    
    public void setStatus(OrderStatus status) {
        this.status = status;
    }
    
    public BigDecimal getItemsTotal() {
        return itemsTotal;
    }
    
    public void setItemsTotal(BigDecimal itemsTotal) {
        this.itemsTotal = itemsTotal;
    }
    
    public BigDecimal getShippingPrice() {
        return shippingPrice;
    }
    
    public void setShippingPrice(BigDecimal shippingPrice) {
        this.shippingPrice = shippingPrice;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public Long getEnderecoEntregaId() {
        return enderecoEntregaId;
    }
    
    public void setEnderecoEntregaId(Long enderecoEntregaId) {
        this.enderecoEntregaId = enderecoEntregaId;
    }
    
    public String getEnderecoCep() {
        return enderecoCep;
    }
    
    public void setEnderecoCep(String enderecoCep) {
        this.enderecoCep = enderecoCep;
    }
    
    public String getEnderecoLogradouro() {
        return enderecoLogradouro;
    }
    
    public void setEnderecoLogradouro(String enderecoLogradouro) {
        this.enderecoLogradouro = enderecoLogradouro;
    }
    
    public String getEnderecoNumero() {
        return enderecoNumero;
    }
    
    public void setEnderecoNumero(String enderecoNumero) {
        this.enderecoNumero = enderecoNumero;
    }
    
    public String getEnderecoComplemento() {
        return enderecoComplemento;
    }
    
    public void setEnderecoComplemento(String enderecoComplemento) {
        this.enderecoComplemento = enderecoComplemento;
    }
    
    public String getEnderecoBairro() {
        return enderecoBairro;
    }
    
    public void setEnderecoBairro(String enderecoBairro) {
        this.enderecoBairro = enderecoBairro;
    }
    
    public String getEnderecoCidade() {
        return enderecoCidade;
    }
    
    public void setEnderecoCidade(String enderecoCidade) {
        this.enderecoCidade = enderecoCidade;
    }
    
    public String getEnderecoEstado() {
        return enderecoEstado;
    }
    
    public void setEnderecoEstado(String enderecoEstado) {
        this.enderecoEstado = enderecoEstado;
    }
    
    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getPaymentInfo() {
        return paymentInfo;
    }
    
    public void setPaymentInfo(String paymentInfo) {
        this.paymentInfo = paymentInfo;
    }
    
    public String getShippingService() {
        return shippingService;
    }
    
    public void setShippingService(String shippingService) {
        this.shippingService = shippingService;
    }
    
    public Integer getShippingDeadline() {
        return shippingDeadline;
    }
    
    public void setShippingDeadline(Integer shippingDeadline) {
        this.shippingDeadline = shippingDeadline;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<OrderItem> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
}