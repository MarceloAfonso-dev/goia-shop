package com.goiashop.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "produto_imagens")
public class ProdutoImagem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    @JsonBackReference
    private Produto produto;
    
    @Column(name = "nome_arquivo", nullable = false, length = 255)
    private String nomeArquivo;
    
    @Column(name = "caminho_arquivo", nullable = false, length = 500)
    private String caminhoArquivo;
    
    @Column(name = "url_arquivo", nullable = false, length = 500)
    private String urlArquivo;
    
    @Column(name = "is_principal", nullable = false)
    private Boolean isPrincipal = false;
    
    @Column(name = "ordem", nullable = false)
    private Integer ordem = 0;
    
    @Column(name = "tamanho_arquivo")
    private Long tamanhoArquivo;
    
    @Column(name = "tipo_mime", length = 100)
    private String tipoMime;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public ProdutoImagem() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public ProdutoImagem(Produto produto, String nomeArquivo, String caminhoArquivo, String urlArquivo) {
        this();
        this.produto = produto;
        this.nomeArquivo = nomeArquivo;
        this.caminhoArquivo = caminhoArquivo;
        this.urlArquivo = urlArquivo;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Produto getProduto() {
        return produto;
    }
    
    public void setProduto(Produto produto) {
        this.produto = produto;
    }
    
    public String getNomeArquivo() {
        return nomeArquivo;
    }
    
    public void setNomeArquivo(String nomeArquivo) {
        this.nomeArquivo = nomeArquivo;
    }
    
    public String getCaminhoArquivo() {
        return caminhoArquivo;
    }
    
    public void setCaminhoArquivo(String caminhoArquivo) {
        this.caminhoArquivo = caminhoArquivo;
    }
    
    public String getUrlArquivo() {
        return urlArquivo;
    }
    
    public void setUrlArquivo(String urlArquivo) {
        this.urlArquivo = urlArquivo;
    }
    
    public Boolean getIsPrincipal() {
        return isPrincipal;
    }
    
    public void setIsPrincipal(Boolean isPrincipal) {
        this.isPrincipal = isPrincipal;
    }
    
    public Integer getOrdem() {
        return ordem;
    }
    
    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }
    
    public Long getTamanhoArquivo() {
        return tamanhoArquivo;
    }
    
    public void setTamanhoArquivo(Long tamanhoArquivo) {
        this.tamanhoArquivo = tamanhoArquivo;
    }
    
    public String getTipoMime() {
        return tipoMime;
    }
    
    public void setTipoMime(String tipoMime) {
        this.tipoMime = tipoMime;
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
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "ProdutoImagem{" +
                "id=" + id +
                ", nomeArquivo='" + nomeArquivo + '\'' +
                ", isPrincipal=" + isPrincipal +
                ", ordem=" + ordem +
                '}';
    }
}