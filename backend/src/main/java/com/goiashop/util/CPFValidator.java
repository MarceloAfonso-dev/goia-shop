package com.goiashop.util;

/**
 * Utilitário para validação de CPF
 */
public class CPFValidator {
    
    /**
     * Valida se um CPF é válido usando o algoritmo oficial
     * @param cpf - CPF com ou sem formatação
     * @return true se o CPF for válido
     */
    public static boolean isValid(String cpf) {
        if (cpf == null) {
            return false;
        }
        
        // Remove formatação (pontos, traços, espaços)
        String cpfLimpo = cpf.replaceAll("\\D", "");
        
        // Verifica se tem 11 dígitos
        if (cpfLimpo.length() != 11) {
            return false;
        }
        
        // Verifica se todos os dígitos são iguais (CPFs inválidos como 111.111.111-11)
        if (cpfLimpo.matches("(\\d)\\1{10}")) {
            return false;
        }
        
        // Calcula o primeiro dígito verificador
        int soma = 0;
        for (int i = 0; i < 9; i++) {
            soma += Character.getNumericValue(cpfLimpo.charAt(i)) * (10 - i);
        }
        int resto = soma % 11;
        int digito1 = resto < 2 ? 0 : 11 - resto;
        
        // Verifica o primeiro dígito
        if (Character.getNumericValue(cpfLimpo.charAt(9)) != digito1) {
            return false;
        }
        
        // Calcula o segundo dígito verificador
        soma = 0;
        for (int i = 0; i < 10; i++) {
            soma += Character.getNumericValue(cpfLimpo.charAt(i)) * (11 - i);
        }
        resto = soma % 11;
        int digito2 = resto < 2 ? 0 : 11 - resto;
        
        // Verifica o segundo dígito
        return Character.getNumericValue(cpfLimpo.charAt(10)) == digito2;
    }
    
    /**
     * Remove formatação do CPF, mantendo apenas os dígitos
     * @param cpf - CPF com ou sem formatação
     * @return CPF apenas com dígitos
     */
    public static String cleanCPF(String cpf) {
        if (cpf == null) {
            return null;
        }
        return cpf.replaceAll("\\D", "");
    }
    
    /**
     * Formata CPF para o padrão XXX.XXX.XXX-XX
     * @param cpf - CPF apenas com dígitos
     * @return CPF formatado
     */
    public static String formatCPF(String cpf) {
        if (cpf == null || cpf.length() != 11) {
            return cpf;
        }
        return cpf.replaceAll("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
    }
}