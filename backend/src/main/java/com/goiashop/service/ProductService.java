package com.goiashop.service;

import com.goiashop.model.Product;
import com.goiashop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    // Get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    // Get product by ID
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    // Create new product
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
    
    // Update existing product
    public Product updateProduct(Long id, Product productDetails) {
        Optional<Product> product = productRepository.findById(id);
        
        if (product.isPresent()) {
            Product existingProduct = product.get();
            existingProduct.setName(productDetails.getName());
            existingProduct.setDescription(productDetails.getDescription());
            existingProduct.setPrice(productDetails.getPrice());
            existingProduct.setStock(productDetails.getStock());
            
            return productRepository.save(existingProduct);
        }
        
        return null;
    }
    
    // Delete product
    public boolean deleteProduct(Long id) {
        Optional<Product> product = productRepository.findById(id);
        
        if (product.isPresent()) {
            productRepository.deleteById(id);
            return true;
        }
        
        return false;
    }
}
