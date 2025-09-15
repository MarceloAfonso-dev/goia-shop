package com.goiashop.controller;

import com.goiashop.dto.ProdutoAlteracaoQuantidadeRequest; // Mudança: import do DTO de alteração de quantidade
import com.goiashop.dto.ProdutoCadastroRequest;
import com.goiashop.model.Produto;
import com.goiashop.model.ProdutoImagem;
import com.goiashop.service.AuthService;
import com.goiashop.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;
    
    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<Produto>> listarProdutos() {
        List<Produto> produtos = produtoService.listarTodos();
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        Produto produto = produtoService.buscarPorId(id);
        if (produto != null) {
            return ResponseEntity.ok(produto);
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Lista imagens de um produto
     */
    @GetMapping("/{id}/images")
    public ResponseEntity<List<ProdutoImagem>> listarImagens(@PathVariable Long id) {
        List<ProdutoImagem> imagens = produtoService.listarImagensPorProduto(id);
        return ResponseEntity.ok(imagens);
    }
    
    /**
     * Cadastra um novo produto
     */
    @PostMapping
    public ResponseEntity<?> cadastrarProduto(
            @Valid @RequestBody ProdutoCadastroRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            // Validar token e obter usuário
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token de autorização necessário");
            }
            
            String tokenValue = token.substring(7);
            var user = authService.validateSession(tokenValue);
            if (user == null) {
                return ResponseEntity.status(401).body("Sessão inválida");
            }
            
            // Verificar se é admin (apenas admin pode cadastrar produtos)
            if (!authService.isAdmin(tokenValue)) {
                return ResponseEntity.status(403).body("Apenas administradores podem cadastrar produtos");
            }
            
            Produto produto = produtoService.cadastrarProduto(request, user.getId());
            return ResponseEntity.ok(produto);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao cadastrar produto: " + e.getMessage());
        }
    }
    
    /**
     * Adiciona imagem a um produto
     */
    @PostMapping("/{id}/images")
    public ResponseEntity<?> adicionarImagem(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPrincipal", defaultValue = "false") boolean isPrincipal,
            @RequestParam(value = "ordem", defaultValue = "0") Integer ordem,
            @RequestHeader("Authorization") String token) {
        try {
            // Validar token e obter usuário
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token de autorização necessário");
            }
            
            String tokenValue = token.substring(7);
            var user = authService.validateSession(tokenValue);
            if (user == null) {
                return ResponseEntity.status(401).body("Sessão inválida");
            }
            
            // Verificar se é admin (apenas admin pode adicionar imagens)
            if (!authService.isAdmin(tokenValue)) {
                return ResponseEntity.status(403).body("Apenas administradores podem adicionar imagens");
            }
            
            ProdutoImagem imagem = produtoService.adicionarImagem(id, file, isPrincipal, ordem, user.getId());
            return ResponseEntity.ok(imagem);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao adicionar imagem: " + e.getMessage());
        }
    }
    
    /**
     * Ativa um produto
     */
    @PatchMapping("/{id}/ativar")
    public ResponseEntity<?> ativarProduto(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            // Validar token e obter usuário
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token de autorização necessário");
            }
            
            String tokenValue = token.substring(7);
            var user = authService.validateSession(tokenValue);
            if (user == null) {
                return ResponseEntity.status(401).body("Sessão inválida");
            }
            
            // Verificar se é admin (apenas admin pode ativar/inativar produtos)
            if (!authService.isAdmin(tokenValue)) {
                return ResponseEntity.status(403).body("Apenas administradores podem ativar/inativar produtos");
            }
            
            Produto produto = produtoService.ativarProduto(id, user.getId());
            return ResponseEntity.ok(produto);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao ativar produto: " + e.getMessage());
        }
    }
    
    /**
     * Inativa um produto
     */
    @PatchMapping("/{id}/inativar")
    public ResponseEntity<?> inativarProduto(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            // Validar token e obter usuário
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token de autorização necessário");
            }
            
            String tokenValue = token.substring(7);
            var user = authService.validateSession(tokenValue);
            if (user == null) {
                return ResponseEntity.status(401).body("Sessão inválida");
            }
            
            // Verificar se é admin (apenas admin pode ativar/inativar produtos)
            if (!authService.isAdmin(tokenValue)) {
                return ResponseEntity.status(403).body("Apenas administradores podem ativar/inativar produtos");
            }
            
            Produto produto = produtoService.inativarProduto(id, user.getId());
            return ResponseEntity.ok(produto);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao inativar produto: " + e.getMessage());
        }
    }

    // MUDANÇA: Novo endpoint para alterar quantidade em estoque
    /**
     * Altera a quantidade em estoque de um produto
     */
    @PutMapping("/{id}/quantidade")
    public ResponseEntity<?> alterarQuantidadeEstoque(
            @PathVariable Long id,
            @Valid @RequestBody ProdutoAlteracaoQuantidadeRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            // Validar token e obter usuário
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token de autorização necessário");
            }
            
            String tokenValue = token.substring(7);
            var user = authService.validateSession(tokenValue);
            if (user == null) {
                return ResponseEntity.status(401).body("Sessão inválida");
            }
            
            // Verificar se é admin ou estoquista (ambos podem alterar quantidade)
            if (!authService.isAdmin(tokenValue) && !authService.isEstoquista(tokenValue)) {
                return ResponseEntity.status(403).body("Apenas administradores e estoquistas podem alterar quantidade");
            }
            
            Produto produto = produtoService.alterarQuantidadeEstoque(id, request, user.getId());
            return ResponseEntity.ok(produto);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao alterar quantidade: " + e.getMessage());
        }
    }
    // FIM DA MUDANÇA
}