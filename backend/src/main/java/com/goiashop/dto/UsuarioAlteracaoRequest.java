package com.goiashop.dto;

import jakarta.validation.constraints.Pattern;

public class UsuarioAlteracaoRequest {
    
    private String nome;
    private String cpf;
    
    @Pattern(regexp = "\\d{6}", message = "Senha deve conter exatamente 6 dígitos")
    private String senha;
    private String confirmaSenha;
    private String grupo; // "ADMIN" ou "ESTOQUISTA"
    
    // Constructors
    public UsuarioAlteracaoRequest() {}
    
    public UsuarioAlteracaoRequest(String nome, String cpf, String senha, String confirmaSenha, String grupo) {
        this.nome = nome;
        this.cpf = cpf;
        this.senha = senha;
        this.confirmaSenha = confirmaSenha;
        this.grupo = grupo;
    }
    
    // Getters and Setters
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public String getCpf() {
        return cpf;
    }
    
    public void setCpf(String cpf) {
        this.cpf = cpf;
    }
    
    public String getSenha() {
        return senha;
    }
    
    public void setSenha(String senha) {
        this.senha = senha;
    }
    
    public String getConfirmaSenha() {
        return confirmaSenha;
    }
    
    public void setConfirmaSenha(String confirmaSenha) {
        this.confirmaSenha = confirmaSenha;
    }
    
    public String getGrupo() {
        return grupo;
    }
    
    public void setGrupo(String grupo) {
        this.grupo = grupo;
    }
}
