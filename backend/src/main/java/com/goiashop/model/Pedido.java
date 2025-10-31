package com.goiashop.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "pedidos")
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    @JsonIgnoreProperties({"pedidos", "senha", "createdAt", "updatedAt"})
    private Cliente cliente;
    
    @Column(name = "numero_pedido", nullable = false, unique = true, length = 20)
    private String numeroPedido;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PedidoStatus status = PedidoStatus.PENDENTE;
    
    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;
    
    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;
    
    @Column(name = "forma_pagamento", length = 50)
    private String formaPagamento;
    
    // Endereço de entrega
    @Column(name = "entrega_cep", length = 9)
    private String entregaCep;
    
    @Column(name = "entrega_logradouro", length = 200)
    private String entregaLogradouro;
    
    @Column(name = "entrega_numero", length = 10)
    private String entregaNumero;
    
    @Column(name = "entrega_complemento", length = 100)
    private String entregaComplemento;
    
    @Column(name = "entrega_bairro", length = 100)
    private String entregaBairro;
    
    @Column(name = "entrega_cidade", length = 100)
    private String entregaCidade;
    
    @Column(name = "entrega_estado", length = 2)
    private String entregaEstado;
    
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<PedidoItem> itens;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Pedido() {
        this.createdAt = LocalDateTime.now();
        this.numeroPedido = generateNumeroPedido();
        this.valorTotal = BigDecimal.ZERO;
    }
    
    public Pedido(Cliente cliente) {
        this();
        this.cliente = cliente;
    }
    
    private String generateNumeroPedido() {
        return "PED" + System.currentTimeMillis();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Cliente getCliente() {
        return cliente;
    }
    
    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }
    
    public String getNumeroPedido() {
        return numeroPedido;
    }
    
    public void setNumeroPedido(String numeroPedido) {
        this.numeroPedido = numeroPedido;
    }
    
    public PedidoStatus getStatus() {
        return status;
    }
    
    public void setStatus(PedidoStatus status) {
        this.status = status;
    }
    
    public BigDecimal getValorTotal() {
        return valorTotal;
    }
    
    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }
    
    public String getObservacoes() {
        return observacoes;
    }
    
    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
    
    public String getFormaPagamento() {
        return formaPagamento;
    }
    
    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }
    
    public String getEntregaCep() {
        return entregaCep;
    }
    
    public void setEntregaCep(String entregaCep) {
        this.entregaCep = entregaCep;
    }
    
    public String getEntregaLogradouro() {
        return entregaLogradouro;
    }
    
    public void setEntregaLogradouro(String entregaLogradouro) {
        this.entregaLogradouro = entregaLogradouro;
    }
    
    public String getEntregaNumero() {
        return entregaNumero;
    }
    
    public void setEntregaNumero(String entregaNumero) {
        this.entregaNumero = entregaNumero;
    }
    
    public String getEntregaComplemento() {
        return entregaComplemento;
    }
    
    public void setEntregaComplemento(String entregaComplemento) {
        this.entregaComplemento = entregaComplemento;
    }
    
    public String getEntregaBairro() {
        return entregaBairro;
    }
    
    public void setEntregaBairro(String entregaBairro) {
        this.entregaBairro = entregaBairro;
    }
    
    public String getEntregaCidade() {
        return entregaCidade;
    }
    
    public void setEntregaCidade(String entregaCidade) {
        this.entregaCidade = entregaCidade;
    }
    
    public String getEntregaEstado() {
        return entregaEstado;
    }
    
    public void setEntregaEstado(String entregaEstado) {
        this.entregaEstado = entregaEstado;
    }
    
    public List<PedidoItem> getItens() {
        return itens;
    }
    
    public void setItens(List<PedidoItem> itens) {
        this.itens = itens;
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
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public enum PedidoStatus {
        PENDENTE,
        CONFIRMADO,
        PREPARANDO,
        ENVIADO,
        ENTREGUE,
        CANCELADO
    }
}
