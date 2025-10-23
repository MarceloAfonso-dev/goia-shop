package com.goiashop.repository;

import com.goiashop.model.EnderecoEntrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnderecoEntregaRepository extends JpaRepository<EnderecoEntrega, Long> {
    
    /**
     * Buscar todos os endereços de um cliente
     */
    List<EnderecoEntrega> findByClienteIdOrderByIsPadraoDescCreatedAtAsc(Long clienteId);
    
    /**
     * Buscar endereço padrão de um cliente
     */
    Optional<EnderecoEntrega> findByClienteIdAndIsPadraoTrue(Long clienteId);
    
    /**
     * Contar endereços de um cliente
     */
    long countByClienteId(Long clienteId);
    
    /**
     * Verificar se o endereço pertence ao cliente
     */
    boolean existsByIdAndClienteId(Long id, Long clienteId);
    
    /**
     * Buscar endereço por ID e cliente
     */
    Optional<EnderecoEntrega> findByIdAndClienteId(Long id, Long clienteId);
}
