package com.goiashop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.goiashop.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Busca usuário por email
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Verifica se existe usuário com o email
     */
    boolean existsByEmail(String email);
    
    /**
     * Verifica se existe usuário com o CPF
     */
    boolean existsByCpf(String cpf);
    
    /**
     * Busca usuário por email e status ativo
     */
    Optional<User> findByEmailAndStatus(String email, User.UserStatus status);
    
    /**
     * Lista usuários por grupo
     */
    List<User> findByGrupo(User.UserGroup grupo);
    
    /**
     * Lista usuários por status
     */
    List<User> findByStatus(User.UserStatus status);
    
    /**
     * Lista usuários que contenham o nome (busca parcial, insensível a maiúsculas)
     */
    List<User> findByNomeContainingIgnoreCase(String nome);
    
    /**
     * Lista usuários por nome com paginação
     */
    Page<User> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
    
    /**
     * Lista usuários por status com paginação
     */
    Page<User> findByStatus(User.UserStatus status, Pageable pageable);
    
    /**
     * Lista usuários com filtros opcionais e paginação
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:nome IS NULL OR LOWER(u.nome) LIKE LOWER(CONCAT('%', :nome, '%'))) AND " +
           "(:status IS NULL OR u.status = :status)")
    Page<User> findByFilters(@Param("nome") String nome, 
                           @Param("status") User.UserStatus status, 
                           Pageable pageable);
}
