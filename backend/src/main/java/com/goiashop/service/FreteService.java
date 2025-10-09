package com.goiashop.service;

import com.goiashop.dto.FreteOption;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class FreteService {
    
    /**
     * Calcula as opções de frete disponíveis para um CEP e valor total
     */
    public List<FreteOption> calcularFrete(String cep, Double valorTotal) {
        List<FreteOption> opcoes = new ArrayList<>();
        
        // Validar CEP
        if (cep == null || cep.trim().isEmpty()) {
            throw new RuntimeException("CEP é obrigatório");
        }
        
        // Limpar CEP (remover formatação)
        String cepLimpo = cep.replaceAll("\\D", "");
        
        if (cepLimpo.length() != 8) {
            throw new RuntimeException("CEP deve conter 8 dígitos");
        }
        
        // Verificar se é um CEP válido (básico)
        if (!isValidCEP(cepLimpo)) {
            throw new RuntimeException("CEP inválido");
        }
        
        // Calcular frete baseado na região (baseado nos primeiros dígitos do CEP)
        double multiplicadorRegiao = getMultiplicadorRegiao(cepLimpo);
        double valorBase = valorTotal != null ? valorTotal : 100.0;
        
        // PAC - Mais barato, mais lento
        BigDecimal valorPAC = BigDecimal.valueOf(15.90 * multiplicadorRegiao)
            .setScale(2, RoundingMode.HALF_UP);
        opcoes.add(new FreteOption(
            "PAC",
            "PAC - Correios",
            valorPAC,
            8 + (int)(multiplicadorRegiao * 2), // 8-12 dias úteis
            "Entrega econômica pelos Correios"
        ));
        
        // SEDEX - Preço médio, velocidade média
        BigDecimal valorSEDEX = BigDecimal.valueOf(25.90 * multiplicadorRegiao)
            .setScale(2, RoundingMode.HALF_UP);
        opcoes.add(new FreteOption(
            "SEDEX",
            "SEDEX - Correios",
            valorSEDEX,
            3 + (int)(multiplicadorRegiao), // 3-5 dias úteis
            "Entrega rápida pelos Correios"
        ));
        
        // EXPRESSO - Mais caro, mais rápido
        BigDecimal valorExpresso = BigDecimal.valueOf(39.90 * multiplicadorRegiao)
            .setScale(2, RoundingMode.HALF_UP);
        opcoes.add(new FreteOption(
            "EXPRESSO",
            "Entrega Expressa",
            valorExpresso,
            1 + (int)(multiplicadorRegiao * 0.5), // 1-2 dias úteis
            "Entrega expressa em até 2 dias úteis"
        ));
        
        // Frete grátis para compras acima de R$ 500
        if (valorBase >= 500.0) {
            opcoes.add(new FreteOption(
                "GRATIS",
                "Frete Grátis",
                BigDecimal.ZERO,
                5 + (int)(multiplicadorRegiao), // 5-7 dias úteis
                "Frete grátis para compras acima de R$ 500"
            ));
        }
        
        return opcoes;
    }
    
    /**
     * Valida se o CEP existe (validação básica)
     */
    private boolean isValidCEP(String cep) {
        // Verificar se não são todos zeros
        if (cep.equals("00000000")) {
            return false;
        }
        
        // Verificar faixas de CEP válidas (aproximado)
        int primeiro = Integer.parseInt(cep.substring(0, 2));
        
        // Faixas válidas de CEP no Brasil (aproximado)
        return primeiro >= 1 && primeiro <= 99;
    }
    
    /**
     * Calcula multiplicador baseado na região do CEP
     */
    private double getMultiplicadorRegiao(String cep) {
        int regiao = Integer.parseInt(cep.substring(0, 1));
        
        switch (regiao) {
            case 0: // São Paulo (região metropolitana)
                return 1.0;
            case 1: // São Paulo (interior)
                return 1.2;
            case 2: // Rio de Janeiro
                return 1.1;
            case 3: // Minas Gerais
                return 1.3;
            case 4: // Bahia
                return 1.5;
            case 5: // Paraná
                return 1.4;
            case 6: // Pernambuco
                return 1.6;
            case 7: // Ceará
                return 1.7;
            case 8: // Brasília/Goiás
                return 1.2;
            case 9: // Mato Grosso/Rondônia
                return 1.8;
            default:
                return 1.5; // Padrão
        }
    }
}