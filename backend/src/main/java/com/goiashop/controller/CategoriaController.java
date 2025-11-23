package com.goiashop.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.goiashop.model.Categoria;
import com.goiashop.repository.CategoriaRepository;

/**
 * Controller para gerenciamento de categorias de produtos
 */
@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    /**
     * Lista todas as categorias ativas
     * GET /api/categorias
     */
    @GetMapping
    public ResponseEntity<List<Categoria>> listarCategorias() {
        try {
            List<Categoria> categorias = categoriaRepository.findByAtivoTrueOrderByNomeAsc();
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Lista categorias ativas para uso público (sem autenticação)
     * GET /api/categorias/public
     */
    @GetMapping("/public")
    public ResponseEntity<List<Categoria>> listarCategoriasPublico() {
        try {
            List<Categoria> categorias = categoriaRepository.findByAtivoTrueOrderByNomeAsc();
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}