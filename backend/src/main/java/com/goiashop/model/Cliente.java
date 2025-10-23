package com.goiashop.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "clientes")
public class Cliente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Nome é obrigatório")
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;
    
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    @Column(name = "email", nullable = false, length = 120, unique = true)
    private String email;
    
    @NotBlank(message = "CPF é obrigatório")
    @Column(name = "cpf", nullable = false, length = 11, unique = true)
    private String cpf;
    
    @Column(name = "telefone", length = 20)
    private String telefone;
    
    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "genero")
    private Genero genero;
    
    @JsonIgnore
    @NotBlank(message = "Senha é obrigatória")
    @Column(name = "senha_hash", nullable = false, length = 255)
    private String senhaHash;
    
    // Endereço principal
    @Column(name = "cep", length = 9)
    private String cep;
    
    @Column(name = "logradouro", length = 200)
    private String logradouro;
    
    @Column(name = "numero", length = 10)
    private String numero;
    
    @Column(name = "complemento", length = 100)
    private String complemento;
    
    @Column(name = "bairro", length = 100)
    private String bairro;
    
    @Column(name = "cidade", length = 100)
    private String cidade;
    
    @Column(name = "estado", length = 2)
    private String estado;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ClienteStatus status = ClienteStatus.ATIVO;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Cliente() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Cliente(String nome, String email, String cpf, String senhaHash) {
        this();
        this.nome = nome;
        this.email = email;
        this.cpf = cpf;
        this.senhaHash = senhaHash;
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
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getCpf() {
        return cpf;
    }
    
    public void setCpf(String cpf) {
        this.cpf = cpf;
    }
    
    public String getTelefone() {
        return telefone;
    }
    
    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }
    
    public LocalDate getDataNascimento() {
        return dataNascimento;
    }
    
    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }
    
    public Genero getGenero() {
        return genero;
    }
    
    public void setGenero(Genero genero) {
        this.genero = genero;
    }
    
    public String getSenhaHash() {
        return senhaHash;
    }
    
    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
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
    
    public ClienteStatus getStatus() {
        return status;
    }
    
    public void setStatus(ClienteStatus status) {
        this.status = status;
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
        return "Cliente{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", email='" + email + '\'' +
                ", cpf='" + cpf + '\'' +
                ", status=" + status +
                '}';
    }
    
    public enum ClienteStatus {
        ATIVO, INATIVO, BLOQUEADO
    }
    
    public enum Genero {
        MASCULINO, FEMININO, OUTRO, NAO_INFORMADO
    }
}
