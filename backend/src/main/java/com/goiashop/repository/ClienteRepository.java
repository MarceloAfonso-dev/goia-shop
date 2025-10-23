package com.goiashop.repository;

import com.goiashop.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
    Optional<Cliente> findByEmail(String email);
    
    Optional<Cliente> findByCpf(String cpf);
    
    @Query("SELECT c FROM Cliente c WHERE c.email = :email OR c.cpf = :cpf")
    Optional<Cliente> findByEmailOrCpf(@Param("email") String email, @Param("cpf") String cpf);
    
    boolean existsByEmail(String email);
    
    boolean existsByCpf(String cpf);
}
