package com.goiashop.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.goiashop.model.Produto;
import com.goiashop.repository.ProdutoRepository;

/**
 * Serviço para controle de estoque - S5-TECH
 * Gerencia movimentações de entrada e saída de estoque
 */
@Service
@Transactional
public class EstoqueMovimentoService {
    
    private static final Logger logger = LoggerFactory.getLogger(EstoqueMovimentoService.class);
    
    @Autowired
    private ProdutoRepository produtoRepository;
    
    /**
     * Debita estoque para uma venda
     */
    public void debitStock(Long produtoId, Integer quantity, Long orderId, String motivo) {
        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + produtoId));
        
        int saldoAnterior = produto.getQuantidadeEstoque();
        
        if (saldoAnterior < quantity) {
            throw new RuntimeException(String.format(
                "Estoque insuficiente para produto '%s'. Disponível: %d, Solicitado: %d",
                produto.getNome(), saldoAnterior, quantity));
        }
        
        int novoSaldo = saldoAnterior - quantity;
        produto.setQuantidadeEstoque(novoSaldo);
        produtoRepository.save(produto);
        
        // TODO: Salvar movimento na tabela estoque_movimento quando implementada
        
        logger.info("Estoque debitado - Produto: {} | Quantidade: {} | Saldo anterior: {} | Novo saldo: {} | Motivo: {}", 
                   produto.getNome(), quantity, saldoAnterior, novoSaldo, motivo);
    }
    
    /**
     * Restaura estoque (cancelamento/devolução)
     */
    public void restoreStock(Long produtoId, Integer quantity, Long orderId, String motivo) {
        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + produtoId));
        
        int saldoAnterior = produto.getQuantidadeEstoque();
        int novoSaldo = saldoAnterior + quantity;
        
        produto.setQuantidadeEstoque(novoSaldo);
        produtoRepository.save(produto);
        
        // TODO: Salvar movimento na tabela estoque_movimento quando implementada
        
        logger.info("Estoque restaurado - Produto: {} | Quantidade: {} | Saldo anterior: {} | Novo saldo: {} | Motivo: {}", 
                   produto.getNome(), quantity, saldoAnterior, novoSaldo, motivo);
    }
}