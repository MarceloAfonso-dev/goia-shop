package com.goiashop.dto;

public class FreteRequest {
    
    private String cep;
    private Double valorTotal;
    
    // Constructors
    public FreteRequest() {}
    
    public FreteRequest(String cep, Double valorTotal) {
        this.cep = cep;
        this.valorTotal = valorTotal;
    }
    
    // Getters and Setters
    public String getCep() {
        return cep;
    }
    
    public void setCep(String cep) {
        this.cep = cep;
    }
    
    public Double getValorTotal() {
        return valorTotal;
    }
    
    public void setValorTotal(Double valorTotal) {
        this.valorTotal = valorTotal;
    }
}