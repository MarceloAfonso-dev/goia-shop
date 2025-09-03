package com.goiashop.repository;

import com.goiashop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Basic CRUD operations are automatically provided by JpaRepository
    // You can add custom query methods here if needed
}
