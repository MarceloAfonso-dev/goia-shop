package com.goiashop.dto;

import java.time.LocalDate;
import java.util.List;

import com.goiashop.model.Customer;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CustomerSignupRequest {

    @NotBlank(message = "Nome completo é obrigatório")
    @Pattern(regexp = "^[A-Za-zÀ-ÿ]+\\s+[A-Za-zÀ-ÿ]+(\\s+[A-Za-zÀ-ÿ]+)*$", 
             message = "Nome completo deve conter pelo menos 2 palavras com mínimo 3 letras cada")
    private String nomeCompleto;

    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter apenas 11 dígitos numéricos")
    private String cpf;

    @NotNull(message = "Data de nascimento é obrigatória")
    private LocalDate dataNascimento;

    @NotNull(message = "Gênero é obrigatório")
    private Customer.Genero genero;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 64, max = 64, message = "Senha deve ser um hash SHA-256 de 64 caracteres")
    private String senhaHash;

    @NotNull(message = "Endereço de faturamento é obrigatório")
    @Valid
    private EnderecoRequest enderecoFaturamento;

    @NotEmpty(message = "Pelo menos um endereço de entrega é obrigatório")
    @Valid
    private List<EnderecoRequest> enderecosEntrega;

    // Getters e Setters
    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public Customer.Genero getGenero() {
        return genero;
    }

    public void setGenero(Customer.Genero genero) {
        this.genero = genero;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public EnderecoRequest getEnderecoFaturamento() {
        return enderecoFaturamento;
    }

    public void setEnderecoFaturamento(EnderecoRequest enderecoFaturamento) {
        this.enderecoFaturamento = enderecoFaturamento;
    }

    public List<EnderecoRequest> getEnderecosEntrega() {
        return enderecosEntrega;
    }

    public void setEnderecosEntrega(List<EnderecoRequest> enderecosEntrega) {
        this.enderecosEntrega = enderecosEntrega;
    }
}
