package com.goiashop.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.goiashop.dto.ViaCepResponse;

@Service
public class ViaCepService {

    private static final String VIACEP_URL = "https://viacep.com.br/ws/{cep}/json/";
    private final RestTemplate restTemplate;

    public ViaCepService() {
        this.restTemplate = new RestTemplate();
    }

    public ViaCepResponse consultarCep(String cep) {
        try {
            // Remove caracteres não numéricos
            String cepLimpo = cep.replaceAll("\\D", "");
            
            if (cepLimpo.length() != 8) {
                throw new IllegalArgumentException("CEP deve ter 8 dígitos");
            }

            ViaCepResponse response = restTemplate.getForObject(
                VIACEP_URL.replace("{cep}", cepLimpo),
                ViaCepResponse.class
            );

            if (response != null && response.hasError()) {
                throw new IllegalArgumentException("CEP não encontrado");
            }

            return response;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao consultar CEP: " + e.getMessage());
        }
    }

    public boolean validarCep(String cep) {
        try {
            ViaCepResponse response = consultarCep(cep);
            return response != null && !response.hasError();
        } catch (Exception e) {
            return false;
        }
    }
}
