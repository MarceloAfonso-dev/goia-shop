package com.goiashop.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UsuarioCadastroRequest {
    
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    private String nome;
    
    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter exatamente 11 dígitos")
    private String cpf;
    
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ter formato válido")
    private String email;
    
    @NotBlank(message = "Senha é obrigatória")
    @Pattern(regexp = "\\d{6}", message = "Senha deve conter exatamente 6 dígitos")
    private String senha;
    
    @NotBlank(message = "Confirmação de senha é obrigatória")
    private String confirmaSenha;
    
    @NotBlank(message = "Grupo é obrigatório")
    @Pattern(regexp = "ADMIN|ESTOQUISTA", message = "Grupo deve ser ADMIN ou ESTOQUISTA")
    private String grupo;
    
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
