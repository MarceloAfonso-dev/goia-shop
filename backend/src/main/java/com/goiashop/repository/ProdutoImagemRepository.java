package com.goiashop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.goiashop.model.ProdutoImagem;

@Repository
public interface ProdutoImagemRepository extends JpaRepository<ProdutoImagem, Long> {
    
    List<ProdutoImagem> findByProdutoIdOrderByOrdemAsc(Long produtoId);
    
    @Query("SELECT pi FROM ProdutoImagem pi WHERE pi.produto.id = :produtoId AND pi.isPrincipal = true")
    Optional<ProdutoImagem> findImagemPrincipalByProdutoId(@Param("produtoId") Long produtoId);
    
    void deleteByProdutoId(Long produtoId);
    
    long countByProdutoId(Long produtoId);
}