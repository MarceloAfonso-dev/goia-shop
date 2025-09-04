package com.goiashop.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class PasswordService {
    
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    
    public PasswordService() {
        this.bCryptPasswordEncoder = new BCryptPasswordEncoder();
    }
    
    /**
     * Aplica SHA-256 em uma string
     */
    public String applySHA256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes("UTF-8"));
            
            // Converte bytes para hexadecimal
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao aplicar SHA-256", e);
        }
    }
    
    /**
     * Aplica BCrypt em um hash SHA-256
     * Este método é usado no servidor para criptografar o hash SHA-256 recebido do frontend
     */
    public String applyBCrypt(String sha256Hash) {
        return bCryptPasswordEncoder.encode(sha256Hash);
    }
    
    /**
     * Verifica se o hash SHA-256 (vindo do frontend) corresponde ao hash BCrypt armazenado
     */
    public boolean verifyPassword(String sha256FromFrontend, String bcryptFromDatabase) {
        return bCryptPasswordEncoder.matches(sha256FromFrontend, bcryptFromDatabase);
    }
    
    /**
     * Método completo para criptografar uma senha (SHA-256 + BCrypt)
     * Usado quando criamos/atualizamos usuários no backend
     */
    public String encryptPassword(String plainPassword) {
        String sha256Hash = applySHA256(plainPassword);
        return applyBCrypt(sha256Hash);
    }
    
    /**
     * Método para validar senha completa (para testes ou casos especiais)
     */
    public boolean validatePassword(String plainPassword, String bcryptFromDatabase) {
        String sha256Hash = applySHA256(plainPassword);
        return verifyPassword(sha256Hash, bcryptFromDatabase);
    }
}
