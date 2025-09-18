package com.goiashop.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.goiashop.dto.PaginatedResponse;
import com.goiashop.dto.ProdutoAlteracaoQuantidadeRequest;
import com.goiashop.dto.ProdutoCadastroRequest;
import com.goiashop.dto.ProdutoCompletoRequest;
import com.goiashop.dto.ProdutoImagemRequest;
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
    
    /**
     * Lista produtos com paginação e filtros
     */
    public PaginatedResponse<Produto> listarComPaginacao(String nome, Long codigo, String status, int page, int size) {
        // Configurar ordenação por data de criação (decrescente)
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Produto.ProdutoStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                statusEnum = Produto.ProdutoStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignora status inválido
            }
        }
        
        Page<Produto> produtoPage = produtoRepository.findByFilters(nome, codigo, statusEnum, pageable);
        
        return new PaginatedResponse<>(
            produtoPage.getContent(),
            produtoPage.getNumber(),
            produtoPage.getSize(),
            produtoPage.getTotalElements()
        );
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
    public Produto editarProduto(Long id, ProdutoCadastroRequest request, Long userId) {
        // Buscar produto existente
        Produto produto = buscarPorId(id);
        if (produto == null) {
            throw new IllegalArgumentException("Produto não encontrado");
        }
        
        // Salvar valores antigos para auditoria
        Map<String, Object> oldValues = new HashMap<>();
        oldValues.put("nome", produto.getNome());
        oldValues.put("descricao", produto.getDescricao());
        oldValues.put("preco", produto.getPreco());
        oldValues.put("quantidadeEstoque", produto.getQuantidadeEstoque());
        oldValues.put("avaliacao", produto.getAvaliacao());
        oldValues.put("status", produto.getStatus());
        
        // Atualizar campos
        produto.setNome(request.getNome());
        produto.setDescricao(request.getDescricao());
        produto.setPreco(request.getPreco());
        produto.setQuantidadeEstoque(request.getQuantidadeEstoque());
        produto.setAvaliacao(request.getAvaliacao());
        produto.setUpdatedAt(LocalDateTime.now());
        produto.setUpdatedBy(userId);
        
        // Definir status
        if (request.getStatus() != null) {
            produto.setStatus(Produto.ProdutoStatus.valueOf(request.getStatus().toUpperCase()));
        }
        
        // Salvar produto
        Produto produtoAtualizado = produtoRepository.save(produto);
        
        // Registrar auditoria
        Map<String, Object> newValues = new HashMap<>();
        newValues.put("nome", produtoAtualizado.getNome());
        newValues.put("descricao", produtoAtualizado.getDescricao());
        newValues.put("preco", produtoAtualizado.getPreco());
        newValues.put("quantidadeEstoque", produtoAtualizado.getQuantidadeEstoque());
        newValues.put("avaliacao", produtoAtualizado.getAvaliacao());
        newValues.put("status", produtoAtualizado.getStatus());
        
        auditLogService.logUpdate(userId, "produtos_ecommerce", produtoAtualizado.getId(), oldValues, newValues);
        
        return produtoAtualizado;
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
    
    /**
     * Atualiza um produto completo com gerenciamento de imagens
     */
    @Transactional
    public Produto atualizarProdutoCompleto(Long produtoId, ProdutoCompletoRequest request, Long userId) {
        Optional<Produto> produtoOpt = produtoRepository.findById(produtoId);
        if (!produtoOpt.isPresent()) {
            throw new IllegalArgumentException("Produto não encontrado");
        }

        Produto produto = produtoOpt.get();
        
        // Armazenar dados antigos para auditoria
        Map<String, Object> oldData = new HashMap<>();
        oldData.put("nome", produto.getNome());
        oldData.put("descricao", produto.getDescricao());
        oldData.put("preco", produto.getPreco());
        oldData.put("quantidade_estoque", produto.getQuantidadeEstoque());
        oldData.put("status", produto.getStatus());
        oldData.put("avaliacao", produto.getAvaliacao());

        // Atualizar campos do produto
        produto.setNome(request.getNome());
        produto.setDescricao(request.getDescricao());
        produto.setPreco(request.getPreco());
        produto.setQuantidadeEstoque(request.getQuantidadeEstoque());
        produto.setStatus(Produto.ProdutoStatus.valueOf(request.getStatus()));
        produto.setAvaliacao(request.getAvaliacao());
        produto.setUpdatedAt(LocalDateTime.now());
        produto.setUpdatedBy(userId);

        // Gerenciar imagens se fornecidas
        if (request.getImagens() != null && !request.getImagens().isEmpty()) {
            gerenciarImagensProduto(produto, request.getImagens(), userId);
        }

        // Salvar produto
        Produto produtoAtualizado = produtoRepository.save(produto);

        // Registrar auditoria
        Map<String, Object> newData = new HashMap<>();
        newData.put("nome", produto.getNome());
        newData.put("descricao", produto.getDescricao());
        newData.put("preco", produto.getPreco());
        newData.put("quantidade_estoque", produto.getQuantidadeEstoque());
        newData.put("status", produto.getStatus());
        newData.put("avaliacao", produto.getAvaliacao());
        auditLogService.logUpdate(userId, "produtos_ecommerce", produtoId, oldData, newData);

        return produtoAtualizado;
    }
    
    /**
     * Gerencia as imagens de um produto (ordem, principal, remoção)
     */
    @Transactional
    public void gerenciarImagensProduto(Produto produto, List<ProdutoImagemRequest> imagensRequest, Long userId) {
        for (ProdutoImagemRequest imgRequest : imagensRequest) {
            Optional<ProdutoImagem> imagemOpt = produtoImagemRepository.findById(imgRequest.getImagemId());
            if (imagemOpt.isPresent()) {
                ProdutoImagem imagem = imagemOpt.get();
                
                // Verificar se a imagem pertence ao produto
                if (!imagem.getProduto().getId().equals(produto.getId())) {
                    throw new IllegalArgumentException("Imagem não pertence ao produto");
                }
                
                // Armazenar dados antigos para auditoria
                Map<String, Object> oldData = new HashMap<>();
                oldData.put("is_principal", imagem.getIsPrincipal());
                oldData.put("ordem", imagem.getOrdem());
                
                // Atualizar ordem se fornecida
                if (imgRequest.getOrdem() != null) {
                    imagem.setOrdem(imgRequest.getOrdem());
                }
                
                // Atualizar imagem principal se fornecida
                if (imgRequest.getIsPrincipal() != null) {
                    if (imgRequest.getIsPrincipal()) {
                        // Remover principal de todas as outras imagens do produto e reordenar
                        List<ProdutoImagem> todasImagens = produtoImagemRepository.findByProdutoIdOrderByOrdemAsc(produto.getId());
                        
                        // Reordenar: nova principal vai para posição 0, outras seguem
                        int novaOrdem = 0;
                        for (ProdutoImagem img : todasImagens) {
                            if (img.getId().equals(imagem.getId())) {
                                // Esta é a nova imagem principal - vai para posição 0
                                img.setIsPrincipal(true);
                                img.setOrdem(0);
                            } else {
                                // Outras imagens - remover principal e ajustar ordem
                                img.setIsPrincipal(false);
                                img.setOrdem(++novaOrdem);
                            }
                            produtoImagemRepository.save(img);
                        }
                        
                        // Atualizar a imagem atual
                        imagem.setIsPrincipal(true);
                        imagem.setOrdem(0);
                    } else {
                        imagem.setIsPrincipal(false);
                    }
                }
                
                imagem.setUpdatedAt(LocalDateTime.now());
                produtoImagemRepository.save(imagem);
                
                // Registrar auditoria
                Map<String, Object> newData = new HashMap<>();
                newData.put("is_principal", imagem.getIsPrincipal());
                newData.put("ordem", imagem.getOrdem());
                auditLogService.logUpdate(userId, "produto_imagens", imagem.getId(), oldData, newData);
            }
        }
    }
    
    /**
     * Remove uma imagem de um produto
     */
    @Transactional
    public void removerImagemProduto(Long produtoId, Long imagemId, Long userId) {
        Optional<ProdutoImagem> imagemOpt = produtoImagemRepository.findById(imagemId);
        if (!imagemOpt.isPresent()) {
            throw new IllegalArgumentException("Imagem não encontrada");
        }
        
        ProdutoImagem imagem = imagemOpt.get();
        
        // Verificar se a imagem pertence ao produto
        if (!imagem.getProduto().getId().equals(produtoId)) {
            throw new IllegalArgumentException("Imagem não pertence ao produto");
        }
        
        // Se for a imagem principal, definir outra como principal
        if (imagem.getIsPrincipal()) {
            List<ProdutoImagem> outrasImagens = produtoImagemRepository.findByProdutoIdOrderByOrdemAsc(produtoId);
            outrasImagens.removeIf(img -> img.getId().equals(imagemId));
            
            if (!outrasImagens.isEmpty()) {
                ProdutoImagem novaPrincipal = outrasImagens.get(0);
                novaPrincipal.setIsPrincipal(true);
                produtoImagemRepository.save(novaPrincipal);
            }
        }
        
        // Registrar auditoria antes de remover
        Map<String, Object> oldData = new HashMap<>();
        oldData.put("nome_arquivo", imagem.getNomeArquivo());
        oldData.put("caminho_arquivo", imagem.getCaminhoArquivo());
        oldData.put("is_principal", imagem.getIsPrincipal());
        oldData.put("ordem", imagem.getOrdem());
        
        auditLogService.logDelete(userId, "produto_imagens", imagemId, oldData);
        
        // Remover arquivo físico
        try {
            imageStorage.deleteImage(imagem.getCaminhoArquivo());
        } catch (Exception e) {
            // Log do erro mas não falha a operação
            System.err.println("Erro ao remover arquivo físico: " + e.getMessage());
        }
        
        // Remover do banco
        produtoImagemRepository.delete(imagem);
    }
    
    /**
     * Adiciona novas imagens a um produto
     */
    @Transactional
    public List<ProdutoImagem> adicionarImagensProduto(Long produtoId, List<MultipartFile> arquivos, Long userId) {
        Optional<Produto> produtoOpt = produtoRepository.findById(produtoId);
        if (!produtoOpt.isPresent()) {
            throw new IllegalArgumentException("Produto não encontrado");
        }
        
        Produto produto = produtoOpt.get();
        List<ProdutoImagem> imagensAdicionadas = new java.util.ArrayList<>();
        
        // Obter próxima ordem
        long countImagens = produtoImagemRepository.countByProdutoId(produtoId);
        int proximaOrdem = (int) countImagens;
        
        for (MultipartFile arquivo : arquivos) {
            try {
                // Upload da imagem
                ImageStorageFilesystem.ImageStorageResult result = imageStorage.saveImage(arquivo, "produtos");
                
                // Criar entidade da imagem
                ProdutoImagem imagem = new ProdutoImagem();
                imagem.setProduto(produto);
                imagem.setNomeArquivo(result.getOriginalName());
                imagem.setCaminhoArquivo(result.getRelativePath());
                imagem.setUrlArquivo(result.getPublicUrl());
                imagem.setTamanhoArquivo(arquivo.getSize());
                imagem.setTipoMime(arquivo.getContentType());
                imagem.setOrdem(proximaOrdem++);
                imagem.setIsPrincipal(countImagens == 0); // Primeira imagem é principal
                
                ProdutoImagem imagemSalva = produtoImagemRepository.save(imagem);
                imagensAdicionadas.add(imagemSalva);
                
                // Registrar auditoria
                Map<String, Object> newData = new HashMap<>();
                newData.put("nome_arquivo", imagem.getNomeArquivo());
                newData.put("caminho_arquivo", imagem.getCaminhoArquivo());
                newData.put("url_arquivo", imagem.getUrlArquivo());
                newData.put("is_principal", imagem.getIsPrincipal());
                newData.put("ordem", imagem.getOrdem());
                newData.put("tamanho_arquivo", imagem.getTamanhoArquivo());
                newData.put("tipo_mime", imagem.getTipoMime());
                
                auditLogService.logCreate(userId, "produto_imagens", imagemSalva.getId(), newData);
                
            } catch (Exception e) {
                throw new RuntimeException("Erro ao processar imagem: " + e.getMessage(), e);
            }
        }
        
        return imagensAdicionadas;
    }
    
    /**
     * Define uma imagem como principal
     */
    @Transactional
    public void definirImagemPrincipal(Long produtoId, Long imagemId, Long userId) {
        Optional<ProdutoImagem> imagemOpt = produtoImagemRepository.findById(imagemId);
        if (!imagemOpt.isPresent()) {
            throw new IllegalArgumentException("Imagem não encontrada");
        }
        
        ProdutoImagem imagem = imagemOpt.get();
        
        // Verificar se a imagem pertence ao produto
        if (!imagem.getProduto().getId().equals(produtoId)) {
            throw new IllegalArgumentException("Imagem não pertence ao produto");
        }
        
        // Reordenar todas as imagens: nova principal vai para posição 0
        List<ProdutoImagem> todasImagens = produtoImagemRepository.findByProdutoIdOrderByOrdemAsc(produtoId);
        int novaOrdem = 0;
        
        for (ProdutoImagem img : todasImagens) {
            Map<String, Object> oldData = new HashMap<>();
            oldData.put("is_principal", img.getIsPrincipal());
            oldData.put("ordem", img.getOrdem());
            
            if (img.getId().equals(imagemId)) {
                // Esta é a nova imagem principal - vai para posição 0
                img.setIsPrincipal(true);
                img.setOrdem(0);
            } else {
                // Outras imagens - remover principal e ajustar ordem
                img.setIsPrincipal(false);
                img.setOrdem(++novaOrdem);
            }
            
            produtoImagemRepository.save(img);
            
            // Registrar auditoria
            Map<String, Object> newData = new HashMap<>();
            newData.put("is_principal", img.getIsPrincipal());
            newData.put("ordem", img.getOrdem());
            auditLogService.logUpdate(userId, "produto_imagens", img.getId(), oldData, newData);
        }
    }
    
    // FIM DAS MUDANÇAS

}
