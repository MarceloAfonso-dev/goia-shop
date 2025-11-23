package com.goiashop.model;

public enum PaymentMethod {
    PIX("PIX"),
    BOLETO("BOLETO"), 
    CARTAO("CARTAO"),
    SALDO_GOIA("SALDO_GOIA");
    
    private final String value;
    
    PaymentMethod(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    @Override
    public String toString() {
        return value;
    }
}