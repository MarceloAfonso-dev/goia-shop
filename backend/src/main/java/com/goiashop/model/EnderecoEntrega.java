package com.goiashop.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enderecos_entrega")
public class EnderecoEntrega {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;
    
    @NotBlank(message = "CEP é obrigatório")
    @Column(name = "cep", nullable = false, length = 8)
    private String cep;
    
    @NotBlank(message = "Logradouro é obrigatório")
    @Column(name = "logradouro", nullable = false, length = 200)
    private String logradouro;
    
    @NotBlank(message = "Número é obrigatório")
    @Column(name = "numero", nullable = false, length = 10)
    private String numero;
    
    @Column(name = "complemento", length = 100)
    private String complemento;
    
    @NotBlank(message = "Bairro é obrigatório")
    @Column(name = "bairro", nullable = false, length = 100)
    private String bairro;
    
    @NotBlank(message = "Cidade é obrigatória")
    @Column(name = "cidade", nullable = false, length = 100)
    private String cidade;
    
    @NotBlank(message = "Estado é obrigatório")
    @Size(min = 2, max = 2, message = "Estado deve ter 2 caracteres")
    @Column(name = "estado", nullable = false, length = 2)
    private String estado;
    
    @Column(name = "is_padrao", nullable = false)
    private Boolean isPadrao = false;
    
    @Column(name = "apelido", length = 50)
    private String apelido; // Ex: "Casa", "Trabalho", "Casa da Mãe"
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public EnderecoEntrega() {
        this.createdAt = LocalDateTime.now();
        this.isPadrao = false;
    }
    
    public EnderecoEntrega(Cliente cliente, String cep, String logradouro, String numero, 
                          String bairro, String cidade, String estado) {
        this();
        this.cliente = cliente;
        this.cep = cep;
        this.logradouro = logradouro;
        this.numero = numero;
        this.bairro = bairro;
        this.cidade = cidade;
        this.estado = estado;
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
    
    public String getCep() {
        return cep;
    }
    
    public void setCep(String cep) {
        this.cep = cep;
    }
    
    public String getLogradouro() {
        return logradouro;
    }
    
    public void setLogradouro(String logradouro) {
        this.logradouro = logradouro;
    }
    
    public String getNumero() {
        return numero;
    }
    
    public void setNumero(String numero) {
        this.numero = numero;
    }
    
    public String getComplemento() {
        return complemento;
    }
    
    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }
    
    public String getBairro() {
        return bairro;
    }
    
    public void setBairro(String bairro) {
        this.bairro = bairro;
    }
    
    public String getCidade() {
        return cidade;
    }
    
    public void setCidade(String cidade) {
        this.cidade = cidade;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public Boolean getIsPadrao() {
        return isPadrao;
    }
    
    public void setIsPadrao(Boolean isPadrao) {
        this.isPadrao = isPadrao;
    }
    
    public String getApelido() {
        return apelido;
    }
    
    public void setApelido(String apelido) {
        this.apelido = apelido;
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
    
    @Override
    public String toString() {
        return "EnderecoEntrega{" +
                "id=" + id +
                ", cep='" + cep + '\'' +
                ", logradouro='" + logradouro + '\'' +
                ", numero='" + numero + '\'' +
                ", bairro='" + bairro + '\'' +
                ", cidade='" + cidade + '\'' +
                ", estado='" + estado + '\'' +
                ", isPadrao=" + isPadrao +
                ", apelido='" + apelido + '\'' +
                '}';
    }
}
