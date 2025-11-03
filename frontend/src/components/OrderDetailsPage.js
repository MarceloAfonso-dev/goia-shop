import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import EcommerceHeader from './EcommerceHeader';
import api from '../utils/api';
import './OrderDetailsPage.css';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Verificar se há token
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        
        if (!token || !userType || userType !== 'cliente') {
            navigate('/login');
            return;
        }

        loadOrderDetails();
    }, [id, navigate]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await api.get(`/pedidos/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setPedido(response.data);
        } catch (error) {
            console.error('Erro ao carregar detalhes do pedido:', error);
            setError('Pedido não encontrado ou você não tem permissão para visualizá-lo');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDENTE': '#ffa500',
            'CONFIRMADO': '#007bff', 
            'PAGO': '#28a745',
            'PROCESSANDO': '#17a2b8',
            'ENVIADO': '#6f42c1',
            'ENTREGUE': '#28a745',
            'CANCELADO': '#dc3545'
        };
        return colors[status] || '#6c757d';
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <EcommerceHeader />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Carregando detalhes do pedido...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-wrapper">
                <EcommerceHeader />
                <div className="error-container">
                    <div className="error-content">
                        <div className="error-icon">❌</div>
                        <h2>Erro ao carregar pedido</h2>
                        <p>{error}</p>
                        <button 
                            className="btn-back"
                            onClick={() => navigate('/minha-conta')}
                        >
                            Voltar para Minha Conta
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!pedido) {
        return null;
    }

    return (
        <div className="page-wrapper">
            <EcommerceHeader />
            
            <div className="order-details-container">
                {/* Header do pedido */}
                <div className="order-header">
                    <button 
                        className="btn-back-arrow"
                        onClick={() => navigate('/minha-conta')}
                    >
                        ← Voltar
                    </button>
                    <div className="order-header-info">
                        <h1>Detalhes do Pedido</h1>
                        <div className="order-number-status">
                            <span className="order-number">#{pedido.numeroPedido}</span>
                            <span 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(pedido.status) }}
                            >
                                {pedido.status}
                            </span>
                        </div>
                        <p className="order-date">Realizado em {formatDate(pedido.createdAt)}</p>
                    </div>
                </div>

                <div className="order-content">
                    {/* Informações do pedido */}
                    <div className="order-info-section">
                        <div className="info-card">
                            <h3>📦 Resumo do Pedido</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Valor dos Itens:</span>
                                    <span className="info-value">{formatCurrency(pedido.itemsTotal || pedido.valorTotal)}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Frete:</span>
                                    <span className="info-value">{formatCurrency(pedido.shippingPrice || 0)}</span>
                                </div>
                                <div className="info-item total">
                                    <span className="info-label">Total:</span>
                                    <span className="info-value">{formatCurrency(pedido.valorTotal)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-card">
                            <h3>💳 Pagamento</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Forma de Pagamento:</span>
                                    <span className="info-value">{pedido.formaPagamento || pedido.paymentMethod}</span>
                                </div>
                            </div>
                        </div>

                        {(pedido.entregaCep || pedido.entregaLogradouro) && (
                            <div className="info-card">
                                <h3>📍 Endereço de Entrega</h3>
                                <div className="address-info">
                                    <p>{pedido.entregaLogradouro}, {pedido.entregaNumero}</p>
                                    {pedido.entregaComplemento && <p>{pedido.entregaComplemento}</p>}
                                    <p>{pedido.entregaBairro}</p>
                                    <p>{pedido.entregaCidade}, {pedido.entregaEstado}</p>
                                    <p>CEP: {pedido.entregaCep}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Itens do pedido */}
                    <div className="items-section">
                        <div className="items-card">
                            <h3>🛍️ Itens do Pedido</h3>
                            <div className="items-list">
                                {pedido.itens && pedido.itens.map(item => (
                                    <div key={item.id} className="item-row">
                                        <div className="item-info">
                                            <h4>{item.nameSnapshot || item.produtoNome}</h4>
                                            <p className="item-details">
                                                Quantidade: {item.quantity || item.quantidade} × {formatCurrency(item.unitPrice || item.precoUnitario)}
                                            </p>
                                        </div>
                                        <div className="item-total">
                                            {formatCurrency(item.subtotal || item.precoTotal)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;