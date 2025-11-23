import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EcommerceHeader from './EcommerceHeader';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import api from '../utils/api';
import './CheckoutPage.css';

const OrderSummaryPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, clearCart } = useCart();
    
    const [resumo, setResumo] = useState(null);
    const [error, setError] = useState('');
    const [processandoPedido, setProcessandoPedido] = useState(false);
    
    // Dados vindos do checkout
    const { endereco, pagamento, frete } = location.state || {};

    useEffect(() => {

        
        // Se não tem dados do checkout, voltar para checkout
        if (!endereco || !pagamento || !frete || cart.length === 0) {
            navigate('/checkout');
            return;
        }
        
        carregarResumo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endereco, pagamento, frete, cart.length, navigate]);

    const carregarResumo = () => {
        // Usar dados do carrinho local
        const subtotal = cart.reduce((total, item) => {
            const preco = parseFloat(item.preco) || 0;
            const quantidade = parseInt(item.quantidade) || 0;
            const itemSubtotal = preco * quantidade;
            return total + itemSubtotal;
        }, 0);
        
        const resumoLocal = {
            success: true,
            itens: cart.map(item => {
                const preco = parseFloat(item.preco) || 0;
                const quantidade = parseInt(item.quantidade) || 0;
                return {
                    nome: item.nome || 'Produto sem nome',
                    quantidade: quantidade,
                    precoUnitario: preco,
                    subtotal: preco * quantidade
                };
            }),
            subtotal: subtotal,
            frete: frete.valor || 0,
            total: subtotal + (frete.valor || 0),
            freteInfo: frete
        };
        
        setResumo(resumoLocal);
    };

    const finalizarCompra = async () => {
        try {
            setProcessandoPedido(true);
            setError('');
            
            const token = localStorage.getItem('token');
            
            // Se não tiver token, redirecionar para login
            if (!token) {
                alert('Você precisa estar logado para finalizar a compra');
                navigate('/login', {
                    state: {
                        from: '/revisar-pedido',
                        checkoutData: { endereco, pagamento, frete }
                    }
                });
                return;
            }
            
            // Preparar dados do pedido
            const pedidoData = {
                itens: cart.map(item => ({
                    produtoId: item.id,
                    quantidade: item.quantidade,
                    preco: item.preco
                })),
                dadosPedido: {
                    observacoes: pagamento.observacoes || '',
                    formaPagamento: pagamento.metodo.toUpperCase(),
                    // Dados de endereço de entrega
                    cep: endereco.cep,
                    logradouro: endereco.logradouro,
                    numero: endereco.numero,
                    complemento: endereco.complemento || '',
                    bairro: endereco.bairro,
                    cidade: endereco.cidade,
                    estado: endereco.uf,
                    ...(pagamento.metodo === 'cartao' && {
                        numeroCartao: pagamento.numeroCartao,
                        nomeCartao: pagamento.nomeCartao,
                        validadeCartao: pagamento.validadeCartao,
                        cvvCartao: pagamento.cvvCartao,
                        parcelasCartao: parseInt(pagamento.parcelas) || 1
                    })
                }
            };

            const response = await api.post('/pedidos', pedidoData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                // Limpar carrinho
                clearCart();
                
                // Ir para página de confirmação com todos os dados
                navigate('/pedido-confirmado', {
                    state: {
                        pedido: response.data.pedido,
                        resumo: resumo,
                        endereco: endereco,
                        pagamento: pagamento,
                        frete: frete
                    }
                });
            } else {
                setError(response.data.message || 'Erro ao finalizar pedido');
            }

        } catch (err) {
            console.error('Erro ao finalizar pedido:', err);
            setError('Erro ao finalizar pedido. Tente novamente.');
        } finally {
            setProcessandoPedido(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price || 0);
    };

    const voltarParaCheckout = () => {
        navigate('/checkout', {
            state: {
                endereco,
                pagamento,
                frete,
                step: 3
            }
        });
    };

    return (
        <div className="ecommerce-page">
            <EcommerceHeader />
            
            <div className="auth-container">
                <div className="auth-card">
                    {/* Header */}
                    <div className="auth-header">
                        <h1>📋 Revisar Pedido</h1>
                        <p>Confira todos os dados antes de finalizar</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <div className="error-icon">⚠️</div>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="auth-form">
                        {/* Produtos */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '16px',
                                paddingBottom: '12px',
                                borderBottom: '2px solid #f1f5f9'
                            }}>
                                <h3 style={{ margin: 0 }}>🛍️ Produtos</h3>
                                <button 
                                    onClick={() => navigate('/carrinho')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#667eea',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Editar
                                </button>
                            </div>
                            
                            {resumo?.itens?.map((item, index) => (
                                <div key={index} style={{
                                    background: '#f8fafc',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    borderLeft: '4px solid #667eea'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>{item.nome}</h4>
                                            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                                                Quantidade: {item.quantidade}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                                                {formatPrice(item.precoUnitario)} cada
                                            </div>
                                            <div style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                                                {formatPrice(item.subtotal)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Endereço */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '16px',
                                paddingBottom: '12px',
                                borderBottom: '2px solid #f1f5f9'
                            }}>
                                <h3 style={{ margin: 0 }}>📍 Endereço de Entrega</h3>
                                <button 
                                    onClick={() => navigate('/checkout', { state: { endereco, pagamento, frete, step: 1 } })}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#667eea',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Editar
                                </button>
                            </div>
                            
                            <div style={{
                                background: '#f0fdf4',
                                padding: '16px',
                                borderRadius: '8px',
                                borderLeft: '4px solid #48bb78'
                            }}>
                                <p style={{ margin: '4px 0', fontWeight: '600' }}>
                                    {endereco.logradouro}, {endereco.numero}
                                </p>
                                {endereco.complemento && <p style={{ margin: '4px 0' }}>{endereco.complemento}</p>}
                                <p style={{ margin: '4px 0' }}>{endereco.bairro}</p>
                                <p style={{ margin: '4px 0' }}>{endereco.cidade}/{endereco.uf}</p>
                                <p style={{ margin: '4px 0' }}>CEP: {endereco.cep}</p>
                            </div>
                        </div>

                        {/* Frete */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '16px',
                                paddingBottom: '12px',
                                borderBottom: '2px solid #f1f5f9'
                            }}>
                                <h3 style={{ margin: 0 }}>🚚 Frete</h3>
                                <button 
                                    onClick={() => navigate('/checkout', { state: { endereco, pagamento, frete, step: 2 } })}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#667eea',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Editar
                                </button>
                            </div>
                            
                            <div style={{
                                background: '#fffaf0',
                                padding: '16px',
                                borderRadius: '8px',
                                borderLeft: '4px solid #ed8936',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#374151' }}>
                                        {frete.nome || (frete.tipo === 'SEDEX' ? '⚡ SEDEX' : 
                                         frete.tipo === 'PAC' ? '📦 PAC' : 
                                         frete.tipo === 'EXPRESSO' ? '🚀 Expresso' : 
                                         frete.tipo === 'ECONOMICO' ? '📦 Econômico' : 
                                         `🚚 ${frete.tipo}`)}
                                    </div>
                                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                                        {frete.prazoEntrega || frete.prazo} dia(s) úteis
                                    </div>
                                    {frete.descricao && (
                                        <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                                            {frete.descricao}
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontWeight: '600', color: '#374151' }}>
                                    {frete.valor > 0 ? formatPrice(frete.valor) : 'Grátis'}
                                </div>
                            </div>
                        </div>

                        {/* Pagamento */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '16px',
                                paddingBottom: '12px',
                                borderBottom: '2px solid #f1f5f9'
                            }}>
                                <h3 style={{ margin: 0 }}>💳 Forma de Pagamento</h3>
                                <button 
                                    onClick={voltarParaCheckout}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#667eea',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Editar
                                </button>
                            </div>
                            
                            <div style={{
                                background: '#f7fafc',
                                padding: '16px',
                                borderRadius: '8px',
                                borderLeft: '4px solid #667eea'
                            }}>
                                <div style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                    {pagamento.metodo === 'pix' ? '📱 PIX - Instantâneo' : 
                                     pagamento.metodo === 'cartao' ? '💳 Cartão de Crédito' : 
                                     pagamento.metodo === 'boleto' ? '🧾 Boleto Bancário - Vencimento em 3 dias' :
                                     pagamento.metodo === 'saldo_goia' ? '🏦 Saldo em Conta GOIA Bank' :
                                     `💰 ${pagamento.metodo?.toUpperCase()}`}
                                </div>
                                
                                {pagamento.metodo === 'cartao' && (
                                    <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
                                        {pagamento.nomeCartao && (
                                            <div>👤 {pagamento.nomeCartao}</div>
                                        )}
                                        {pagamento.numeroCartao && (
                                            <div>💳 •••• •••• •••• {pagamento.numeroCartao.slice(-4)}</div>
                                        )}
                                        {pagamento.parcelas && pagamento.parcelas > 1 ? (
                                            <div>📊 {pagamento.parcelas}x de {formatPrice((resumo?.total || 0) / pagamento.parcelas)}</div>
                                        ) : (
                                            <div>📊 À vista</div>
                                        )}
                                    </div>
                                )}
                                
                                {pagamento.metodo === 'boleto' && (
                                    <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
                                        <div>📅 Vencimento em 3 dias após confirmação</div>
                                        <div>🏦 Pagável em qualquer banco ou lotérica</div>
                                    </div>
                                )}
                                
                                {pagamento.metodo === 'pix' && (
                                    <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
                                        <div>⚡ Pagamento instantâneo</div>
                                        <div>📱 Use seu banco ou carteira digital</div>
                                    </div>
                                )}
                                
                                {pagamento.metodo === 'saldo_goia' && (
                                    <div style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
                                        <div>🏦 Débito em conta GOIA Bank</div>
                                        <div>💰 Processamento instantâneo</div>
                                    </div>
                                )}
                                
                                {pagamento.observacoes && (
                                    <div style={{ 
                                        marginTop: '12px', 
                                        padding: '12px', 
                                        background: 'rgba(255, 255, 255, 0.7)',
                                        border: '1px solid rgba(102, 126, 234, 0.2)',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        color: '#374151'
                                    }}>
                                        <div style={{ fontWeight: '600', marginBottom: '4px', color: '#667eea' }}>
                                            📝 Observações do Pedido:
                                        </div>
                                        <div style={{ fontStyle: 'italic' }}>
                                            "{pagamento.observacoes}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="order-summary" style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            padding: '24px',
                            color: 'white',
                            marginTop: '32px',
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                        }}>
                            <h3 style={{ 
                                color: 'white', 
                                textAlign: 'center', 
                                marginBottom: '20px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
                            }}>
                                💰 Total do Pedido
                            </h3>
                            
                            <div className="summary-line" style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '16px 20px',
                                borderBottom: '1px solid white',
                                color: 'white',
                                fontSize: '18px',
                                textShadow: '2px 2px 8px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.8)',
                                background: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}>
                                <span style={{ fontWeight: '600', color: 'white' }}>Subtotal dos produtos:</span>
                                <span style={{ fontWeight: '800', fontSize: '19px', color: 'white' }}>{formatPrice(resumo?.subtotal || 0)}</span>
                            </div>
                            <div className="summary-line" style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '16px 20px',
                                borderBottom: '1px solid white',
                                color: 'white',
                                fontSize: '18px',
                                textShadow: '2px 2px 8px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.8)',
                                background: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}>
                                <span style={{ fontWeight: '600', color: 'white' }}>Frete:</span>
                                <span style={{ fontWeight: '800', fontSize: '19px', color: 'white' }}>{frete.valor > 0 ? formatPrice(frete.valor) : 'Grátis'}</span>
                            </div>
                            <div className="summary-total" style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '24px 20px',
                                borderTop: '3px solid white',
                                marginTop: '20px',
                                fontSize: '20px',
                                fontWeight: '800',
                                color: 'white',
                                textShadow: '3px 3px 10px rgba(0,0,0,1), 0 0 15px rgba(0,0,0,0.9)',
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '12px',
                                border: '2px solid rgba(255, 255, 255, 0.5)'
                            }}>
                                <span style={{ fontSize: '22px', color: 'white', fontWeight: '700' }}>Total Geral:</span>
                                <span style={{ 
                                    background: 'white',
                                    color: '#667eea',
                                    padding: '16px 24px',
                                    borderRadius: '12px',
                                    border: '3px solid white',
                                    fontSize: '24px',
                                    fontWeight: '900',
                                    textShadow: 'none',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                                }}>{formatPrice(resumo?.total || 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="checkout-actions">
                        <button 
                            type="button" 
                            onClick={voltarParaCheckout}
                            className="btn-secondary"
                        >
                            ← Voltar e Editar
                        </button>
                        <button 
                            type="button" 
                            onClick={finalizarCompra}
                            disabled={processandoPedido}
                            className="btn-primary"
                        >
                            {processandoPedido ? '⏳ Finalizando...' : '✅ Finalizar Compra'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummaryPage;
