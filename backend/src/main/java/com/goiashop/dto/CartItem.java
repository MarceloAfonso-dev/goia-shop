package com.goiashop.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para item do carrinho - S5-TECH
 */
public class CartItem {
    
    @NotNull(message = "ID do produto é obrigatório")
    private Long produtoId;
    
    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 1, message = "Quantidade deve ser pelo menos 1")
    private Integer quantidade;
    
    // Campos auxiliares para display
    private String nome;
    private java.math.BigDecimal preco;
    private String imagem;
    
    // Construtores
    public CartItem() {}
    
    public CartItem(Long produtoId, Integer quantidade) {
        this.produtoId = produtoId;
        this.quantidade = quantidade;
    }
    
    // Getters e Setters
    public Long getProdutoId() {
        return produtoId;
    }
    
    public void setProdutoId(Long produtoId) {
        this.produtoId = produtoId;
    }
    
    public Integer getQuantidade() {
        return quantidade;
    }
    
    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }
    
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public java.math.BigDecimal getPreco() {
        return preco;
    }
    
    public void setPreco(java.math.BigDecimal preco) {
        this.preco = preco;
    }
    
    public String getImagem() {
        return imagem;
    }
    
    public void setImagem(String imagem) {
        this.imagem = imagem;
    }
}