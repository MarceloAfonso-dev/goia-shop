package com.goiashop.dto;

import java.util.List;

public class CartItemRequest {
    
    private Long produtoId;
    private Integer quantidade;
    
    // Constructors
    public CartItemRequest() {}
    
    public CartItemRequest(Long produtoId, Integer quantidade) {
        this.produtoId = produtoId;
        this.quantidade = quantidade;
    }
    
    // Getters and Setters
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
}
