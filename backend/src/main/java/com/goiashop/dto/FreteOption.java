package com.goiashop.dto;

import java.math.BigDecimal;

public class FreteOption {
    
    private String tipo;
    private String nome;
    private BigDecimal valor;
    private Integer prazoEntrega;
    private String descricao;
    
    // Constructors
    public FreteOption() {}
    
    public FreteOption(String tipo, String nome, BigDecimal valor, Integer prazoEntrega, String descricao) {
        this.tipo = tipo;
        this.nome = nome;
        this.valor = valor;
        this.prazoEntrega = prazoEntrega;
        this.descricao = descricao;
    }
    
    // Getters and Setters
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public BigDecimal getValor() {
        return valor;
    }
    
    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
    
    public Integer getPrazoEntrega() {
        return prazoEntrega;
    }
    
    public void setPrazoEntrega(Integer prazoEntrega) {
        this.prazoEntrega = prazoEntrega;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}