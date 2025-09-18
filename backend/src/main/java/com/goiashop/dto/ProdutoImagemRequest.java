package com.goiashop.dto;

import jakarta.validation.constraints.NotNull;

public class ProdutoImagemRequest {
    
    @NotNull(message = "ID da imagem é obrigatório")
    private Long imagemId;
    
    private Boolean isPrincipal;
    private Integer ordem;
    
    // Constructors
    public ProdutoImagemRequest() {}
    
    public ProdutoImagemRequest(Long imagemId, Boolean isPrincipal, Integer ordem) {
        this.imagemId = imagemId;
        this.isPrincipal = isPrincipal;
        this.ordem = ordem;
    }
    
    // Getters and Setters
    public Long getImagemId() {
        return imagemId;
    }
    
    public void setImagemId(Long imagemId) {
        this.imagemId = imagemId;
    }
    
    public Boolean getIsPrincipal() {
        return isPrincipal;
    }
    
    public void setIsPrincipal(Boolean isPrincipal) {
        this.isPrincipal = isPrincipal;
    }
    
    public Integer getOrdem() {
        return ordem;
    }
    
    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }
}
