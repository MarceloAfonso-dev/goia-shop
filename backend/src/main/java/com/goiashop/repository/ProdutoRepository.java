package com.goiashop.repository;

import com.goiashop.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    
    List<Produto> findByStatus(Produto.ProdutoStatus status);
    
    List<Produto> findByNomeContainingIgnoreCase(String nome);
}
