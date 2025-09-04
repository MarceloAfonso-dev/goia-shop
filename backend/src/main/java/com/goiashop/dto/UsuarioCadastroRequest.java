package com.goiashop.dto;

public class UsuarioCadastroRequest {
    
    private String nome;
    private String cpf;
    private String email;
    private String senha;
    private String confirmaSenha;
    private String grupo; // "ADMIN" ou "ESTOQUISTA"
    
    // Constructors
    public UsuarioCadastroRequest() {}
    
    public UsuarioCadastroRequest(String nome, String cpf, String email, String senha, String confirmaSenha, String grupo) {
        this.nome = nome;
        this.cpf = cpf;
        this.email = email;
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
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
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
