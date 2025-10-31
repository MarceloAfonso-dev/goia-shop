package com.goiashop.model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "pedido_itens")
public class PedidoItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    @JsonBackReference
    private Pedido pedido;
    
    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    @JsonIgnoreProperties({"imagens", "createdAt", "updatedAt", "descricao"})
    private Produto produto;
    
    @Column(name = "quantidade", nullable = false)
    private Integer quantidade;
    
    @Column(name = "preco_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitario;
    
    @Column(name = "preco_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoTotal;
    
    // Dados do produto no momento da compra (para histórico)
    @Column(name = "produto_nome", nullable = false, length = 200)
    private String produtoNome;
    
    @Column(name = "produto_descricao", columnDefinition = "TEXT")
    private String produtoDescricao;
    
    // Constructors
    public PedidoItem() {}
    
    public PedidoItem(Pedido pedido, Produto produto, Integer quantidade) {
        this.pedido = pedido;
        this.produto = produto;
        this.quantidade = quantidade;
        this.precoUnitario = produto.getPreco();
        this.precoTotal = this.precoUnitario.multiply(BigDecimal.valueOf(quantidade));
        this.produtoNome = produto.getNome();
        this.produtoDescricao = produto.getDescricao();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Pedido getPedido() {
        return pedido;
    }
    
    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }
    
    public Produto getProduto() {
        return produto;
    }
    
    public void setProduto(Produto produto) {
        this.produto = produto;
    }
    
    public Integer getQuantidade() {
        return quantidade;
    }
    
    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
        if (this.precoUnitario != null) {
            this.precoTotal = this.precoUnitario.multiply(BigDecimal.valueOf(quantidade));
        }
    }
    
    public BigDecimal getPrecoUnitario() {
        return precoUnitario;
    }
    
    public void setPrecoUnitario(BigDecimal precoUnitario) {
        this.precoUnitario = precoUnitario;
        if (this.quantidade != null) {
            this.precoTotal = precoUnitario.multiply(BigDecimal.valueOf(this.quantidade));
        }
    }
    
    public BigDecimal getPrecoTotal() {
        return precoTotal;
    }
    
    public void setPrecoTotal(BigDecimal precoTotal) {
        this.precoTotal = precoTotal;
    }
    
    public String getProdutoNome() {
        return produtoNome;
    }
    
    public void setProdutoNome(String produtoNome) {
        this.produtoNome = produtoNome;
    }
    
    public String getProdutoDescricao() {
        return produtoDescricao;
    }
    
    public void setProdutoDescricao(String produtoDescricao) {
        this.produtoDescricao = produtoDescricao;
    }
}
