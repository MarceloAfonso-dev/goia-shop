package com.goiashop.repository;

import com.goiashop.model.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

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
           "(:status IS NULL OR p.status = :status)")
    Page<Produto> findByFilters(@Param("nome") String nome, 
                                @Param("codigo") Long codigo, 
                                @Param("status") Produto.ProdutoStatus status, 
                                Pageable pageable);
    
    // ===== MÉTODOS PARA E-COMMERCE =====
    
    List<Produto> findByStatusOrderByIdDesc(Produto.ProdutoStatus status);
    
    List<Produto> findByStatusAndCategoriaContainingIgnoreCaseOrderByIdDesc(
        Produto.ProdutoStatus status, String categoria);
    
    List<Produto> findByStatusAndNomeContainingIgnoreCaseOrderByIdDesc(
        Produto.ProdutoStatus status, String nome);
}
