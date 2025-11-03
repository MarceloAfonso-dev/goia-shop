package com.goiashop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class AlterarSenhaRequest {
    
    @NotBlank(message = "Senha atual é obrigatória")
    @Pattern(regexp = "\\d{6}", message = "Senha atual deve conter exatamente 6 dígitos")
    private String senhaAtual;
    
    @NotBlank(message = "Nova senha é obrigatória")
    @Pattern(regexp = "\\d{6}", message = "Nova senha deve conter exatamente 6 dígitos")
    private String novaSenha;
    
    @NotBlank(message = "Confirmação de senha é obrigatória")
    private String confirmarSenha;
    
    // Constructors
    public AlterarSenhaRequest() {}
    
    public AlterarSenhaRequest(String senhaAtual, String novaSenha, String confirmarSenha) {
        this.senhaAtual = senhaAtual;
        this.novaSenha = novaSenha;
        this.confirmarSenha = confirmarSenha;
    }
    
    // Getters and Setters
    public String getSenhaAtual() {
        return senhaAtual;
    }
    
    public void setSenhaAtual(String senhaAtual) {
        this.senhaAtual = senhaAtual;
    }
    
    public String getNovaSenha() {
        return novaSenha;
    }
    
    public void setNovaSenha(String novaSenha) {
        this.novaSenha = novaSenha;
    }
    
    public String getConfirmarSenha() {
        return confirmarSenha;
    }
    
    public void setConfirmarSenha(String confirmarSenha) {
        this.confirmarSenha = confirmarSenha;
    }
    
    /**
     * Validar se as senhas coincidem
     */
    public boolean senhasCoinciden() {
        return novaSenha != null && novaSenha.equals(confirmarSenha);
    }
}