package com.goiashop.dto;

public class PedidoRequest {
    
    private Long clienteId;
    private String observacoes;
    private String formaPagamento;
    
    // Dados do cartão (simulados - não persistir em produção)
    private String numeroCartao;
    private String nomeCartao;
    private String validadeCartao;
    private String cvvCartao;
    private Integer parcelasCartao;
    
    // Endereço de entrega
    private String cep;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String estado;
    
    // Constructors
    public PedidoRequest() {}
    
    // Getters and Setters
    public Long getClienteId() {
        return clienteId;
    }
    
    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }
    
    public String getObservacoes() {
        return observacoes;
    }
    
    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
    
    public String getFormaPagamento() {
        return formaPagamento;
    }
    
    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
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
    
    // Getters and Setters para dados do cartão
    public String getNumeroCartao() {
        return numeroCartao;
    }
    
    public void setNumeroCartao(String numeroCartao) {
        this.numeroCartao = numeroCartao;
    }
    
    public String getNomeCartao() {
        return nomeCartao;
    }
    
    public void setNomeCartao(String nomeCartao) {
        this.nomeCartao = nomeCartao;
    }
    
    public String getValidadeCartao() {
        return validadeCartao;
    }
    
    public void setValidadeCartao(String validadeCartao) {
        this.validadeCartao = validadeCartao;
    }
    
    public String getCvvCartao() {
        return cvvCartao;
    }
    
    public void setCvvCartao(String cvvCartao) {
        this.cvvCartao = cvvCartao;
    }
    
    public Integer getParcelasCartao() {
        return parcelasCartao;
    }
    
    public void setParcelasCartao(Integer parcelasCartao) {
        this.parcelasCartao = parcelasCartao;
    }
}
