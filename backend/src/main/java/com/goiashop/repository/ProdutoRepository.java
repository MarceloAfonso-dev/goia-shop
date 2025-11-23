package com.goiashop.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.goiashop.model.Produto;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    
    List<Produto> findByStatus(Produto.ProdutoStatus status);
    
    List<Produto> findByNomeContainingIgnoreCase(String nome);
    
    /**
     * Busca produtos com filtros e paginação
     * @param nome Nome do produto (busca parcial, case insensitive)
     * @param codigo Código/ID do produto (busca exata)
     * @param status Status do produto
     * @param pageable Configuração de paginação e ordenação
     * @return Página de produtos
     */
    @Query("SELECT p FROM Produto p WHERE " +
           "(:nome IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :nome, '%'))) AND " +
           "(:codigo IS NULL OR p.id = :codigo) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:categoriaId IS NULL OR p.categoria.id = :categoriaId)")
    Page<Produto> findByFilters(@Param("nome") String nome, 
                                @Param("codigo") Long codigo, 
                                @Param("status") Produto.ProdutoStatus status,
                                @Param("categoriaId") Long categoriaId,
                                Pageable pageable);
    
    // ===== MÉTODOS PARA E-COMMERCE =====
    
    List<Produto> findByStatusOrderByIdDesc(Produto.ProdutoStatus status);
    
    List<Produto> findByStatusAndNomeContainingIgnoreCaseOrderByIdDesc(
        Produto.ProdutoStatus status, String nome);
    
    // Métodos para filtro por categoria
    List<Produto> findByStatusAndCategoriaIdOrderByIdDesc(
        Produto.ProdutoStatus status, Long categoriaId);
        
    List<Produto> findByStatusAndCategoriaIdAndNomeContainingIgnoreCaseOrderByIdDesc(
        Produto.ProdutoStatus status, Long categoriaId, String nome);
}
