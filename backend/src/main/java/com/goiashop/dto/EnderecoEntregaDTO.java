package com.goiashop.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO para endereço de entrega - S5-TECH
 */
public class EnderecoEntregaDTO {
    
    private Long id;
    
    @NotNull(message = "CEP é obrigatório")
    @Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 dígitos")
    private String cep;
    
    @NotNull(message = "Logradouro é obrigatório")
    @Size(min = 1, max = 200, message = "Logradouro deve ter entre 1 e 200 caracteres")
    private String logradouro;
    
    @NotNull(message = "Número é obrigatório")
    @Size(min = 1, max = 10, message = "Número deve ter entre 1 e 10 caracteres")
    private String numero;
    
    @Size(max = 100, message = "Complemento deve ter no máximo 100 caracteres")
    private String complemento;
    
    @NotNull(message = "Bairro é obrigatório")
    @Size(min = 1, max = 100, message = "Bairro deve ter entre 1 e 100 caracteres")
    private String bairro;
    
    @NotNull(message = "Cidade é obrigatória")
    @Size(min = 1, max = 100, message = "Cidade deve ter entre 1 e 100 caracteres")
    private String cidade;
    
    @NotNull(message = "Estado é obrigatório")
    @Pattern(regexp = "[A-Z]{2}", message = "Estado deve ser uma sigla com 2 letras maiúsculas")
    private String estado;
    
    private String apelido;
    private boolean isPadrao;
    
    // Construtores
    public EnderecoEntregaDTO() {}
    
    // Getters e Setters
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
    
    public String getApelido() {
        return apelido;
    }
    
    public void setApelido(String apelido) {
        this.apelido = apelido;
    }
    
    public boolean isPadrao() {
        return isPadrao;
    }
    
    public void setPadrao(boolean padrao) {
        isPadrao = padrao;
    }
}