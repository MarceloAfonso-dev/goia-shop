package com.goiashop.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.goiashop.dto.ProdutoAlteracaoQuantidadeRequest;
import com.goiashop.dto.ProdutoCadastroRequest;
import com.goiashop.model.Produto;
import com.goiashop.model.ProdutoImagem;
import com.goiashop.repository.ProdutoImagemRepository;
import com.goiashop.repository.ProdutoRepository;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;
    
    @Autowired
    private ProdutoImagemRepository produtoImagemRepository;
    
    @Autowired
    private ImageStorageFilesystem imageStorage;
    
    @Autowired
    private AuditLogService auditLogService;

    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    public Produto buscarPorId(Long id) {
        Optional<Produto> produto = produtoRepository.findById(id);
        return produto.orElse(null);
    }

    public List<Produto> listarPorStatus(Produto.ProdutoStatus status) {
        return produtoRepository.findByStatus(status);
    }
    
    @Transactional
    public Produto cadastrarProduto(ProdutoCadastroRequest request, Long userId) {
        // Criar novo produto
        Produto produto = new Produto();
        produto.setNome(request.getNome());
        produto.setDescricao(request.getDescricao());
        produto.setPreco(request.getPreco());
        produto.setQuantidadeEstoque(request.getQuantidadeEstoque());
        produto.setAvaliacao(request.getAvaliacao());
        produto.setCreatedAt(LocalDateTime.now());
        produto.setUpdatedAt(LocalDateTime.now());
        produto.setCreatedBy(userId);
        produto.setUpdatedBy(userId);
        
        // Definir status
        if (request.getStatus() != null) {
            produto.setStatus(Produto.ProdutoStatus.valueOf(request.getStatus().toUpperCase()));
        }
        
        // Salvar produto
        Produto produtoSalvo = produtoRepository.save(produto);
        
        // Registrar auditoria
        Map<String, Object> changes = new HashMap<>();
        changes.put("produto_id", produtoSalvo.getId());
        changes.put("nome", produtoSalvo.getNome());
        auditLogService.logCreate(userId, "produtos_ecommerce", produtoSalvo.getId(), changes);
        
        return produtoSalvo;
    }
    
    @Transactional
    public ProdutoImagem adicionarImagem(Long produtoId, MultipartFile file, boolean isPrincipal, Integer ordem, Long userId) {
        // Buscar produto
        Produto produto = buscarPorId(produtoId);
        if (produto == null) {
            throw new IllegalArgumentException("Produto não encontrado");
        }
        
        try {
            // Upload do arquivo usando a nova arquitetura
            ImageStorageFilesystem.ImageStorageResult uploadResult = imageStorage.saveImage(file, "produtos");
            
            // Se esta imagem for principal, remover flag de outras imagens
            if (isPrincipal) {
                produto.getImagens().forEach(img -> img.setIsPrincipal(false));
            }
            
            // Criar registro da imagem com metadata completa
            ProdutoImagem imagem = new ProdutoImagem();
            imagem.setProduto(produto);
            imagem.setNomeArquivo(uploadResult.getOriginalName());
            imagem.setCaminhoArquivo(uploadResult.getRelativePath());
            imagem.setUrlArquivo(uploadResult.getPublicUrl());
            imagem.setIsPrincipal(isPrincipal);
            imagem.setOrdem(ordem != null ? ordem : 0);
            imagem.setTamanhoArquivo(uploadResult.getFileSize());
            imagem.setTipoMime(uploadResult.getMimeType());
            
            // Salvar
            ProdutoImagem imagemSalva = produtoImagemRepository.save(imagem);
            
            // Registrar auditoria
            Map<String, Object> changes = new HashMap<>();
            changes.put("imagem_id", imagemSalva.getId());
            changes.put("produto_id", produtoId);
            auditLogService.logCreate(userId, "produto_imagens", imagemSalva.getId(), changes);
            
            return imagemSalva;
            
        } catch (Exception e) {
            throw new RuntimeException("Erro ao fazer upload da imagem: " + e.getMessage(), e);
        }
    }
    
    public List<ProdutoImagem> listarImagensPorProduto(Long produtoId) {
        return produtoImagemRepository.findByProdutoIdOrderByOrdemAsc(produtoId);
    }
    
    @Transactional
    public void removerImagem(Long imagemId, Long userId) {
        Optional<ProdutoImagem> imagemOpt = produtoImagemRepository.findById(imagemId);
        if (imagemOpt.isPresent()) {
            ProdutoImagem imagem = imagemOpt.get();
            
            // Deletar arquivo físico
            imageStorage.deleteImage(imagem.getCaminhoArquivo());
            
            // Deletar registro
            produtoImagemRepository.delete(imagem);
            
            // Registrar auditoria
            Map<String, Object> changes = new HashMap<>();
            changes.put("imagem_deletada", imagemId);
            auditLogService.logDelete(userId, "produto_imagens", imagemId, changes);
        }
    }
    
    @Transactional
    public void definirImagemPrincipal(Long imagemId, Long userId) {
        Optional<ProdutoImagem> imagemOpt = produtoImagemRepository.findById(imagemId);
        if (imagemOpt.isPresent()) {
            ProdutoImagem imagem = imagemOpt.get();
            Produto produto = imagem.getProduto();
            
            // Remover flag principal de todas as imagens do produto
            produto.getImagens().forEach(img -> img.setIsPrincipal(false));
            
            // Definir esta como principal
            imagem.setIsPrincipal(true);
            produtoImagemRepository.save(imagem);
            
            // Registrar auditoria
            Map<String, Object> oldData = new HashMap<>();
            oldData.put("is_principal", false);
            Map<String, Object> newData = new HashMap<>();
            newData.put("is_principal", true);
            auditLogService.logUpdate(userId, "produto_imagens", imagemId, oldData, newData);
        }
    }
    
    @Transactional
    public Produto ativarProduto(Long id, Long userId) {
        Optional<Produto> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isPresent()) {
            Produto produto = produtoOpt.get();
            produto.setStatus(Produto.ProdutoStatus.ATIVO);
            produto.setUpdatedAt(LocalDateTime.now());
            produto.setUpdatedBy(userId);

            Produto produtoAtualizado = produtoRepository.save(produto);

            // Registrar auditoria
            Map<String, Object> oldData = new HashMap<>();
            oldData.put("status", "INATIVO");
            Map<String, Object> newData = new HashMap<>();
            newData.put("status", "ATIVO");
            auditLogService.logUpdate(userId, "produtos_ecommerce", id, oldData, newData);

            return produtoAtualizado;
        }
        throw new IllegalArgumentException("Produto não encontrado");
    }

    @Transactional
    public Produto inativarProduto(Long id, Long userId) {
        Optional<Produto> produtoOpt = produtoRepository.findById(id);
        if (produtoOpt.isPresent()) {
            Produto produto = produtoOpt.get();
            produto.setStatus(Produto.ProdutoStatus.INATIVO);
            produto.setUpdatedAt(LocalDateTime.now());
            produto.setUpdatedBy(userId);

            Produto produtoAtualizado = produtoRepository.save(produto);

            // Registrar auditoria
            Map<String, Object> oldData = new HashMap<>();
            oldData.put("status", "ATIVO");
            Map<String, Object> newData = new HashMap<>();
            newData.put("status", "INATIVO");
            auditLogService.logUpdate(userId, "produtos_ecommerce", id, oldData, newData);

            return produtoAtualizado;
        }
        throw new IllegalArgumentException("Produto não encontrado");
    }

    // MÉTODO ADICIONADO: Alterar quantidade em estoque com auditoria
    @Transactional
    public Produto alterarQuantidadeEstoque(Long produtoId, ProdutoAlteracaoQuantidadeRequest request, Long userId) {
        Optional<Produto> produtoOpt = produtoRepository.findById(produtoId);
        if (!produtoOpt.isPresent()) {
            throw new IllegalArgumentException("Produto não encontrado");
        }

        Produto produto = produtoOpt.get();

        // Armazenar valor antigo para auditoria
        Integer quantidadeAnterior = produto.getQuantidadeEstoque();

        // Atualizar quantidade
        produto.setQuantidadeEstoque(request.getQuantidadeEstoque());
        produto.setUpdatedAt(LocalDateTime.now());
        produto.setUpdatedBy(userId);

        // Salvar alterações
        Produto produtoAtualizado = produtoRepository.save(produto);

        // Registrar auditoria
        Map<String, Object> oldData = new HashMap<>();
        oldData.put("quantidade_estoque", quantidadeAnterior);
        Map<String, Object> newData = new HashMap<>();
        newData.put("quantidade_estoque", request.getQuantidadeEstoque());
        auditLogService.logUpdate(userId, "produtos_ecommerce", produtoId, oldData, newData);

        return produtoAtualizado;
    }
    // FIM DAS MUDANÇAS

}
