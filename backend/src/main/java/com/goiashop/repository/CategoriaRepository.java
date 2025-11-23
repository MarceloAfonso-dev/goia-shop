package com.goiashop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.goiashop.model.Categoria;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
    /**
     * Lista todas as categorias ativas ordenadas por nome
     */
    List<Categoria> findByAtivoTrueOrderByNomeAsc();
    
    /**
     * Busca categoria por nome (case insensitive)
     */
    List<Categoria> findByNomeContainingIgnoreCaseAndAtivoTrue(String nome);
    
    /**
     * Lista categorias com contagem de produtos ativos
     */
    @Query("SELECT c FROM Categoria c WHERE c.ativo = true ORDER BY c.nome ASC")
    List<Categoria> findCategoriasAtivasComProdutos();
    
    /**
     * Verifica se existe categoria com o nome (case insensitive)
     */
    boolean existsByNomeIgnoreCase(String nome);
}