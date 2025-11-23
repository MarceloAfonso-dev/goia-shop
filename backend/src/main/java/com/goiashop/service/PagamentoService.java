package com.goiashop.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.goiashop.dto.PedidoRequest;

@Service
public class PagamentoService {
    
    /**
     * Valida dados de pagamento de forma simulada
     */
    public Map<String, Object> validarPagamento(PedidoRequest dadosPedido) {
        Map<String, Object> resultado = new HashMap<>();
        
        String formaPagamento = dadosPedido.getFormaPagamento();
        
        switch (formaPagamento) {
            case "PIX":
                resultado = validarPIX();
                break;
            case "BOLETO":
                resultado = validarBoleto();
                break;
            case "CARTAO":
                resultado = validarCartao(dadosPedido);
                break;
            case "SALDO_GOIA":
                resultado = validarSaldoGoia();
                break;
            default:
                resultado.put("sucesso", false);
                resultado.put("mensagem", "Forma de pagamento não reconhecida");
        }
        
        return resultado;
    }
    
    private Map<String, Object> validarPIX() {
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("sucesso", true);
        resultado.put("mensagem", "PIX aprovado instantaneamente");
        resultado.put("codigoTransacao", "PIX" + System.currentTimeMillis());
        return resultado;
    }
    
    private Map<String, Object> validarBoleto() {
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("sucesso", true);
        resultado.put("mensagem", "Boleto gerado com sucesso");
        resultado.put("codigoBarras", "34191.79001 01043.510047 91020.150008 1 84780000008000");
        resultado.put("vencimento", "3 dias úteis");
        return resultado;
    }
    
    private Map<String, Object> validarCartao(PedidoRequest dadosPedido) {
        Map<String, Object> resultado = new HashMap<>();
        
        // Validação simulada do cartão
        String numeroCartao = dadosPedido.getNumeroCartao();
        
        if (numeroCartao == null || numeroCartao.replace(" ", "").length() < 13) {
            resultado.put("sucesso", false);
            resultado.put("mensagem", "Número do cartão inválido");
            return resultado;
        }
        
        if (dadosPedido.getNomeCartao() == null || dadosPedido.getNomeCartao().length() < 2) {
            resultado.put("sucesso", false);
            resultado.put("mensagem", "Nome no cartão inválido");
            return resultado;
        }
        
        if (dadosPedido.getValidadeCartao() == null || dadosPedido.getValidadeCartao().length() != 5) {
            resultado.put("sucesso", false);
            resultado.put("mensagem", "Validade do cartão inválida");
            return resultado;
        }
        
        if (dadosPedido.getCvvCartao() == null || dadosPedido.getCvvCartao().length() < 3) {
            resultado.put("sucesso", false);
            resultado.put("mensagem", "CVV inválido");
            return resultado;
        }
        
        // Simulação: cartões que terminam em 0000 são negados
        if (numeroCartao.endsWith("0000")) {
            resultado.put("sucesso", false);
            resultado.put("mensagem", "Cartão negado pela operadora");
            return resultado;
        }
        
        // Cartão aprovado
        resultado.put("sucesso", true);
        resultado.put("mensagem", "Cartão aprovado com sucesso");
        resultado.put("codigoAutorizacao", "AUTH" + System.currentTimeMillis());
        resultado.put("parcelas", dadosPedido.getParcelasCartao() != null ? dadosPedido.getParcelasCartao() : 1);
        
        return resultado;
    }
    
    private Map<String, Object> validarSaldoGoia() {
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("sucesso", true);
        resultado.put("mensagem", "Pagamento aprovado com saldo GOIA Bank");
        resultado.put("novoSaldo", "R$ 1.234,56"); // Simulado
        return resultado;
    }
}