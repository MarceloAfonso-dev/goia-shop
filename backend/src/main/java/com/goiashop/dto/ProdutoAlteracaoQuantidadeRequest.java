package com.goiashop.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class ProdutoAlteracaoQuantidadeRequest {
    
    @NotNull(message = "Quantidade é obrigatória")
    @PositiveOrZero(message = "Quantidade deve ser zero ou positiva")
    private Integer quantidadeEstoque;
    
    // Default constructor
    public ProdutoAlteracaoQuantidadeRequest() {}
    
    // Constructor with field
    public ProdutoAlteracaoQuantidadeRequest(Integer quantidadeEstoque) {
        this.quantidadeEstoque = quantidadeEstoque;
    }
    
    // Getters and Setters
    public Integer getQuantidadeEstoque() {
        return quantidadeEstoque;
    }
    
    public void setQuantidadeEstoque(Integer quantidadeEstoque) {
        this.quantidadeEstoque = quantidadeEstoque;
    }
    
    @Override
    public String toString() {
        return "ProdutoAlteracaoQuantidadeRequest{" +
                "quantidadeEstoque=" + quantidadeEstoque +
                '}';
    }
}
