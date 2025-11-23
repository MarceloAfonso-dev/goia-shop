package com.goiashop.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ViaCepService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public ViaCepService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Consultar CEP na API do ViaCEP
     */
    public CepResponse consultarCep(String cep) {
        try {
            // Limpar CEP (remover hífen e espaços)
            String cepLimpo = cep.replaceAll("[^0-9]", "");
            
            // Validar CEP
            if (cepLimpo.length() != 8) {
                throw new RuntimeException("CEP deve conter 8 dígitos");
            }
            
            // Fazer requisição para ViaCEP
            String url = "https://viacep.com.br/ws/" + cepLimpo + "/json/";
            String response = restTemplate.getForObject(url, String.class);
            
            if (response == null) {
                throw new RuntimeException("Erro ao consultar CEP");
            }
            
            CepResponse cepResponse = objectMapper.readValue(response, CepResponse.class);
            
            // Verificar se CEP existe (ViaCEP retorna campo "erro" quando não encontra)
            if (cepResponse.isErro()) {
                throw new RuntimeException("CEP não encontrado");
            }
            
            return cepResponse;
            
        } catch (Exception e) {
            if (e.getMessage().contains("CEP não encontrado") || e.getMessage().contains("CEP deve conter")) {
                throw new RuntimeException(e.getMessage());
            }
            throw new RuntimeException("Erro ao consultar CEP: " + e.getMessage());
        }
    }
    
    /**
     * Classe para resposta do ViaCEP
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CepResponse {
        private String cep;
        private String logradouro;
        private String complemento;
        private String bairro;
        private String localidade;
        private String uf;
        private String ibge;
        private String gia;
        private String ddd;
        private String siafi;
        private Boolean erro;
        
        // Constructors
        public CepResponse() {}
        
        // Getters e Setters
        public String getCep() {
            return cep;
        }
        
        public void setCep(String cep) {
            this.cep = cep;
        }
        
        public String getLogradouro() {
            return logradouro;
        }
        
        public void setLogradouro(String logradouro) {
            this.logradouro = logradouro;
        }
        
        public String getComplemento() {
            return complemento;
        }
        
        public void setComplemento(String complemento) {
            this.complemento = complemento;
        }
        
        public String getBairro() {
            return bairro;
        }
        
        public void setBairro(String bairro) {
            this.bairro = bairro;
        }
        
        public String getLocalidade() {
            return localidade;
        }
        
        public void setLocalidade(String localidade) {
            this.localidade = localidade;
        }
        
        public String getUf() {
            return uf;
        }
        
        public void setUf(String uf) {
            this.uf = uf;
        }
        
        public String getIbge() {
            return ibge;
        }
        
        public void setIbge(String ibge) {
            this.ibge = ibge;
        }
        
        public String getGia() {
            return gia;
        }
        
        public void setGia(String gia) {
            this.gia = gia;
        }
        
        public String getDdd() {
            return ddd;
        }
        
        public void setDdd(String ddd) {
            this.ddd = ddd;
        }
        
        public String getSiafi() {
            return siafi;
        }
        
        public void setSiafi(String siafi) {
            this.siafi = siafi;
        }
        
        public Boolean isErro() {
            return erro != null && erro;
        }
        
        public void setErro(Boolean erro) {
            this.erro = erro;
        }
    }
}