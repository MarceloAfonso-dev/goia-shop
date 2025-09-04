package com.goiashop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
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
}
