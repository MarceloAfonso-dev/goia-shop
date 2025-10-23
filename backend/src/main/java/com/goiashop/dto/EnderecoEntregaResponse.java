package com.goiashop.dto;

import com.goiashop.model.EnderecoEntrega;

public class EnderecoEntregaResponse {
    
    private Long id;
    private String cep;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String estado;
    private Boolean isPadrao;
    private String apelido;
    private String createdAt;
    
    // Constructors
    public EnderecoEntregaResponse() {}
    
    public EnderecoEntregaResponse(EnderecoEntrega endereco) {
        this.id = endereco.getId();
        // Formatar CEP para exibição (00000-000)
        String cep = endereco.getCep();
        if (cep != null && cep.length() == 8) {
            this.cep = cep.substring(0, 5) + "-" + cep.substring(5);
        } else {
            this.cep = cep;
        }
        this.logradouro = endereco.getLogradouro();
        this.numero = endereco.getNumero();
        this.complemento = endereco.getComplemento();
        this.bairro = endereco.getBairro();
        this.cidade = endereco.getCidade();
        this.estado = endereco.getEstado();
        this.isPadrao = endereco.getIsPadrao();
        this.apelido = endereco.getApelido();
        this.createdAt = endereco.getCreatedAt() != null ? endereco.getCreatedAt().toString() : null;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
