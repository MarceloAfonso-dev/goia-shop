package com.goiashop.controller;

import com.goiashop.dto.PaginatedResponse;
import com.goiashop.dto.ProdutoAlteracaoQuantidadeRequest; // Mudança: import do DTO de alteração de quantidade
import com.goiashop.dto.ProdutoCadastroRequest;
import com.goiashop.dto.ProdutoCompletoRequest;
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
    public ResponseEntity<?> listarProdutos(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) Long codigo,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize) {
        
        // Se page foi fornecido, usar paginação
        if (page != null) {
            int size = pageSize != null ? pageSize : 10; // Default 10 itens por página
            PaginatedResponse<Produto> response = produtoService.listarComPaginacao(nome, codigo, status, page, size);
            return ResponseEntity.ok(response);
        } else {
            // Compatibilidade com versão anterior (sem paginação)
            // Para clientes públicos, sempre filtrar apenas produtos ativos
            List<Produto> produtos;
            if (status != null) {
                try {
                    Produto.ProdutoStatus produtoStatus = Produto.ProdutoStatus.valueOf(status);
                    produtos = produtoService.listarPorStatus(produtoStatus);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Status inválido: " + status);
                }
            } else {
                // Se não especificou status, assumir ATIVO para compatibilidade
                produtos = produtoService.listarPorStatus(Produto.ProdutoStatus.ATIVO);
            }
            return ResponseEntity.ok(produtos);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        Produto produto = produtoService.buscarPorId(id);
        if (produto != null) {
            return ResponseEntity.ok(produto);
        }
        return ResponseEntity.notFound().build();
    }
    
    // ===== ENDPOINTS PÚBLICOS PARA E-COMMERCE =====
    
    /**
     * Lista produtos para o e-commerce (sem autenticação)
     * Apenas produtos ativos são retornados
     */
    @GetMapping("/public")
    public ResponseEntity<List<Produto>> listarProdutosPublico() {
        List<Produto> produtos = produtoService.listarProdutosAtivos();
        return ResponseEntity.ok(produtos);
    }
    
    /**
     * Busca produto por ID para o e-commerce (sem autenticação)
     * Apenas produtos ativos são retornados
     */
    @GetMapping("/public/{id}")
    public ResponseEntity<Produto> buscarProdutoPublico(@PathVariable Long id) {
        try {
            Produto produto = produtoService.buscarProdutoPublico(id);
            return ResponseEntity.ok(produto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Busca produtos por nome (sem autenticação)
     */
    @GetMapping("/public/buscar")
    public ResponseEntity<List<Produto>> buscarProdutos(@RequestParam String termo) {
        List<Produto> produtos = produtoService.buscarPorNome(termo);
        return ResponseEntity.ok(produtos);
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

    /**
     * Edita um produto existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> editarProduto(
            @PathVariable Long id,
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
            
            // Verificar se é admin
            if (!authService.isAdmin(tokenValue)) {
                return ResponseEntity.status(403).body("Apenas administradores podem editar produtos");
            }
            
            Produto produto = produtoService.editarProduto(id, request, user.getId());
            return ResponseEntity.ok(produto);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao editar produto: " + e.getMessage());
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
    
    /**
     * Atualiza um produto completo com gerenciamento de imagens
     */
    @PutMapping("/{id}/completo")
    public ResponseEntity<?> atualizarProdutoCompleto(
            @PathVariable Long id,
            @Valid @RequestBody ProdutoCompletoRequest request,
            @RequestHeader("Authorization") String token) {
        
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token de autorização necessário");
            }
            
            String tokenValue = token.substring(7);
            var user = authService.validateSession(tokenValue);
            if (user == null) {
                return ResponseEntity.status(401).body("Sessão inválida");
            }
            
            // Apenas administradores podem editar produtos completos
            if (!authService.isAdmin(tokenValue)) {
                return ResponseEntity.status(403).body("Apenas administradores podem editar produtos completos");
            }
            
            Produto produto = produtoService.atualizarProdutoCompleto(id, request, user.getId());
            return ResponseEntity.ok(produto);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace(); // Log completo do erro
            System.out.println("Erro detalhado: " + e.getClass().getName() + " - " + e.getMessage());
            if (e.getCause() != null) {
                System.out.println("Causa: " + e.getCause().getClass().getName() + " - " + e.getCause().getMessage());
            }
            return ResponseEntity.badRequest().body("Erro ao atualizar produto: " + e.getMessage());
        }
    }
    
    /**
     * Adiciona novas imagens a um produto
     */
    @PostMapping("/{id}/imagens")
    public ResponseEntity<?> adicionarImagens(
            @PathVariable Long id,
            @RequestParam("arquivos") List<MultipartFile> arquivos,
            @RequestHeader("Authorization") String token) {
        
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token de autorização necessário");
            }
            
            String tokenValue = token.substring(7);
            var user = authService.validateSession(tokenValue);
            if (user == null) {
                return ResponseEntity.status(401).body("Sessão inválida");
            }
            
            // Apenas administradores podem adicionar imagens
            if (!authService.isAdmin(tokenValue)) {
                return ResponseEntity.status(403).body("Apenas administradores podem adicionar imagens");
            }
            
            if (arquivos == null || arquivos.isEmpty()) {
                return ResponseEntity.badRequest().body("Nenhum arquivo fornecido");
            }
            
            List<ProdutoImagem> imagens = produtoService.adicionarImagensProduto(id, arquivos, user.getId());
            return ResponseEntity.ok(imagens);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao adicionar imagens: " + e.getMessage());
        }
    }
    
    /**
     * Remove uma imagem de um produto
     */
    @DeleteMapping("/{id}/imagens/{imagemId}")
    public ResponseEntity<?> removerImagem(
            @PathVariable Long id,
            @PathVariable Long imagemId,
            @RequestHeader("Authorization") String token) {
        
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token de autorização necessário");
            }
            
            String tokenValue = token.substring(7);
            var user = authService.validateSession(tokenValue);
            if (user == null) {
                return ResponseEntity.status(401).body("Sessão inválida");
            }
            
            // Apenas administradores podem remover imagens
            if (!authService.isAdmin(tokenValue)) {
                return ResponseEntity.status(403).body("Apenas administradores podem remover imagens");
            }
            
            produtoService.removerImagemProduto(id, imagemId, user.getId());
            return ResponseEntity.ok().body("Imagem removida com sucesso");
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao remover imagem: " + e.getMessage());
        }
    }
    
    /**
     * Define uma imagem como principal
     */
    @PutMapping("/{id}/imagens/{imagemId}/principal")
    public ResponseEntity<?> definirImagemPrincipal(
            @PathVariable Long id,
            @PathVariable Long imagemId,
            @RequestHeader("Authorization") String token) {
        
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token de autorização necessário");
            }
            
            String tokenValue = token.substring(7);
            var user = authService.validateSession(tokenValue);
            if (user == null) {
                return ResponseEntity.status(401).body("Sessão inválida");
            }
            
            // Apenas administradores podem definir imagem principal
            if (!authService.isAdmin(tokenValue)) {
                return ResponseEntity.status(403).body("Apenas administradores podem definir imagem principal");
            }
            
            produtoService.definirImagemPrincipal(id, imagemId, user.getId());
            return ResponseEntity.ok().body("Imagem definida como principal com sucesso");
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao definir imagem principal: " + e.getMessage());
        }
    }
    
    // FIM DA MUDANÇA
}