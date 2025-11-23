import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './PedidosEstoquistaPage.css';

const PedidosEstoquistaPage = () => {
    const { token } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [updating, setUpdating] = useState({});
    
    const pageSize = 10;

    useEffect(() => {
        carregarPedidos();
    }, [currentPage, token]);

    const carregarPedidos = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `http://localhost:8080/api/estoque/pedidos?page=${currentPage}&size=${pageSize}&sort=createdAt,desc`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Acesso negado. Você não tem permissão para acessar esta página.');
                }
                throw new Error('Erro ao carregar pedidos');
            }

            const data = await response.json();
            setPedidos(data.pedidos || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const atualizarStatusPedido = async (pedidoId, novoStatus) => {
        try {
            setUpdating(prev => ({ ...prev, [pedidoId]: true }));

            const response = await fetch(
                `http://localhost:8080/api/estoque/pedidos/${pedidoId}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: novoStatus })
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao atualizar status do pedido');
            }

            // Recarregar a lista de pedidos
            await carregarPedidos();
        } catch (error) {
            setError(error.message);
        } finally {
            setUpdating(prev => ({ ...prev, [pedidoId]: false }));
        }
    };

    const formatarData = (dataString) => {
        if (!dataString) return 'N/A';
        try {
            const data = new Date(dataString);
            return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (error) {
            return 'Data inválida';
        }
    };

    const formatarValor = (valor) => {
        if (!valor) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const obterClasseStatus = (status) => {
        const classes = {
            'PENDENTE': 'status-pendente',
            'CONFIRMADO': 'status-confirmado',
            'PREPARANDO': 'status-processando',
            'ENVIADO': 'status-enviado',
            'ENTREGUE': 'status-entregue',
            'CANCELADO': 'status-cancelado'
        };
        return classes[status] || 'status-default';
    };

    const statusOptions = [
        { value: 'PENDENTE', label: 'Pendente' },
        { value: 'CONFIRMADO', label: 'Confirmado' },
        { value: 'PREPARANDO', label: 'Preparando' },
        { value: 'ENVIADO', label: 'Enviado' },
        { value: 'ENTREGUE', label: 'Entregue' },
        { value: 'CANCELADO', label: 'Cancelado' }
    ];

    if (loading && currentPage === 0) {
        return (
            <div className="pedidos-estoquista-page">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pedidos-estoquista-page">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="page-title">
                                <i className="bi bi-box-seam me-2"></i>
                                Pedidos - Estoque
                            </h2>
                            <button 
                                className="btn btn-outline-primary" 
                                onClick={carregarPedidos}
                                disabled={loading}
                            >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Atualizar
                            </button>
                        </div>

                        {error && (
                            <div className="alert alert-danger d-flex align-items-center" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                            </div>
                        )}

                        {!loading && pedidos.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-inbox display-1 text-muted"></i>
                                <p className="text-muted mt-3">Nenhum pedido encontrado</p>
                            </div>
                        ) : (
                            <>
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <span>
                                            <strong>{totalElements}</strong> pedidos encontrados
                                        </span>
                                        <small className="text-muted">
                                            Página {currentPage + 1} de {totalPages}
                                        </small>
                                    </div>
                                    
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th scope="col" style={{ width: '120px' }}>Nº Pedido</th>
                                                        <th scope="col" style={{ width: '150px' }}>Data</th>
                                                        <th scope="col">Cliente</th>
                                                        <th scope="col" style={{ width: '120px' }}>Valor Total</th>
                                                        <th scope="col" style={{ width: '130px' }}>Status</th>
                                                        <th scope="col" style={{ width: '200px' }}>Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pedidos.map(pedido => (
                                                        <tr key={pedido.id}>
                                                            <td>
                                                                <strong>#{pedido.id}</strong>
                                                            </td>
                                                            <td>
                                                                <small>{formatarData(pedido.createdAt)}</small>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    <strong>{pedido.cliente?.nome || 'N/A'}</strong>
                                                                    {pedido.cliente?.email && (
                                                                        <div>
                                                                            <small className="text-muted">
                                                                                {pedido.cliente.email}
                                                                            </small>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <strong className="text-success">
                                                                    {formatarValor(pedido.valorTotal)}
                                                                </strong>
                                                            </td>
                                                            <td>
                                                                <span className={`badge status-badge ${obterClasseStatus(pedido.status)}`}>
                                                                    {pedido.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex gap-1">
                                                                    <select
                                                                        className="form-select form-select-sm"
                                                                        value={pedido.status}
                                                                        onChange={(e) => atualizarStatusPedido(pedido.id, e.target.value)}
                                                                        disabled={updating[pedido.id]}
                                                                        style={{ width: '140px' }}
                                                                    >
                                                                        {statusOptions.map(option => (
                                                                            <option key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    {updating[pedido.id] && (
                                                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                                            <span className="visually-hidden">Atualizando...</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Paginação */}
                                {totalPages > 1 && (
                                    <nav aria-label="Navegação da paginação" className="mt-4">
                                        <ul className="pagination justify-content-center">
                                            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(0)}
                                                    disabled={currentPage === 0 || loading}
                                                >
                                                    <i className="bi bi-chevron-double-left"></i>
                                                </button>
                                            </li>
                                            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                                    disabled={currentPage === 0 || loading}
                                                >
                                                    <i className="bi bi-chevron-left"></i>
                                                </button>
                                            </li>
                                            
                                            {/* Páginas numeradas */}
                                            {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                                const startPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
                                                const pageNumber = startPage + index;
                                                
                                                if (pageNumber >= totalPages) return null;
                                                
                                                return (
                                                    <li 
                                                        key={pageNumber} 
                                                        className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                                                    >
                                                        <button 
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(pageNumber)}
                                                            disabled={loading}
                                                        >
                                                            {pageNumber + 1}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                            
                                            <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                                    disabled={currentPage === totalPages - 1 || loading}
                                                >
                                                    <i className="bi bi-chevron-right"></i>
                                                </button>
                                            </li>
                                            <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(totalPages - 1)}
                                                    disabled={currentPage === totalPages - 1 || loading}
                                                >
                                                    <i className="bi bi-chevron-double-right"></i>
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PedidosEstoquistaPage;