package com.goiashop.model;

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
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "produtos_ecommerce")
public class Produto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Nome do produto é obrigatório")
    @Column(name = "nome", nullable = false)
    private String nome;
    
    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;
    
    @NotNull(message = "Preço é obrigatório")
    @Positive(message = "Preço deve ser positivo")
    @Column(name = "preco", nullable = false, precision = 10)
    private Double preco;
    
    @NotNull(message = "Estoque é obrigatório")
    @Positive(message = "Estoque deve ser positivo")
    @Column(name = "quantidade_estoque", nullable = false)
    private Integer quantidadeEstoque;
    
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ProdutoStatus status = ProdutoStatus.ATIVO;
    
    @Column(name = "avaliacao")
    private Double avaliacao;
    
    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "updated_by")
    private Long updatedBy;
    
    // Relacionamento com imagens do produto
    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("ordem ASC, id ASC")
    @JsonManagedReference
    private List<ProdutoImagem> imagens = new ArrayList<>();
    
    // Default constructor
    public Produto() {}
    
    // Constructor with fields
    public Produto(String nome, String descricao, Double preco, Integer quantidadeEstoque) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.quantidadeEstoque = quantidadeEstoque;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public ProdutoStatus getStatus() {
        return status;
    }
    
    public void setStatus(ProdutoStatus status) {
        this.status = status;
    }
    
    public Double getAvaliacao() {
        return avaliacao;
    }
    
    public void setAvaliacao(Double avaliacao) {
        this.avaliacao = avaliacao;
    }
    
    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public java.time.LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Long getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
    
    public Long getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    public List<ProdutoImagem> getImagens() {
        return imagens;
    }
    
    public void setImagens(List<ProdutoImagem> imagens) {
        this.imagens = imagens;
    }
    
    // Método utilitário para adicionar imagem
    public void addImagem(ProdutoImagem imagem) {
        imagem.setProduto(this);
        this.imagens.add(imagem);
    }
    
    // Método utilitário para obter imagem principal
    public ProdutoImagem getImagemPrincipal() {
        return imagens.stream()
                .filter(ProdutoImagem::getIsPrincipal)
                .findFirst()
                .orElse(imagens.isEmpty() ? null : imagens.get(0));
    }
    
    @Override
    public String toString() {
        return "Produto{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", descricao='" + descricao + '\'' +
                ", preco=" + preco +
                ", quantidadeEstoque=" + quantidadeEstoque +
                ", status=" + status +
                '}';
    }
    
    public enum ProdutoStatus {
        ATIVO, INATIVO
    }
}
