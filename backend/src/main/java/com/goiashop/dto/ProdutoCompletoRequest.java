package com.goiashop.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ProdutoCompletoRequest {
    
    @NotBlank(message = "Nome do produto é obrigatório")
    private String nome;
    
    private String descricao;
    
    @NotNull(message = "Preço é obrigatório")
    @Positive(message = "Preço deve ser positivo")
    private Double preco;
    
    @NotNull(message = "Estoque é obrigatório")
    // Removendo @Positive para permitir quantidade 0 para admins
    private Integer quantidadeEstoque;
    
    private String status;
    private Double avaliacao;
    
    private List<ProdutoImagemRequest> imagens;
    
    // Constructors
    public ProdutoCompletoRequest() {}
    
    // Getters and Setters
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
    
    public Double getPreco() {
        return preco;
    }
    
    public void setPreco(Double preco) {
        this.preco = preco;
    }
    
    public Integer getQuantidadeEstoque() {
        return quantidadeEstoque;
    }
    
    public void setQuantidadeEstoque(Integer quantidadeEstoque) {
        this.quantidadeEstoque = quantidadeEstoque;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Double getAvaliacao() {
        return avaliacao;
    }
    
    public void setAvaliacao(Double avaliacao) {
        this.avaliacao = avaliacao;
    }
    
    public List<ProdutoImagemRequest> getImagens() {
        return imagens;
    }
    
    public void setImagens(List<ProdutoImagemRequest> imagens) {
        this.imagens = imagens;
    }
}
