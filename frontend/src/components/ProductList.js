import React, { useState, useEffect } from 'react';
import { Table, Card, Badge, Spinner, Alert, Row, Col, Button, Form, InputGroup, Pagination } from 'react-bootstrap';
import api from '../utils/api';
import ProductCadastroModal from './ProductCadastroModal';
import ProductEditModal from './ProductEditCompleteModal';
import ProductDetailPage from './ProductDetailPage';
import { useAuth } from '../hooks/useAuth';

// Ativar/Inativar produto
import { activateProduct, deactivateProduct } from "../utils/api";
import ProductQuantidadeModal from './ProductQuantidadeModal';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCadastroModal, setShowCadastroModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    // Preview removido - agora usa página dedicada
    const [showQuantidadeModal, setShowQuantidadeModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Estados de filtro e paginação
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroCodigo, setFiltroCodigo] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    
    // Estados de paginação
    const [paginationData, setPaginationData] = useState({
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const { isAdmin, isEstoquista } = useAuth();

    useEffect(() => {
        fetchProducts();
    }, [currentPage, pageSize]);

    const fetchProducts = async (nomeFilter = filtroNome, codigoFilter = filtroCodigo, statusFilter = filtroStatus, page = currentPage, size = pageSize) => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: size.toString()
            });

            if (nomeFilter.trim()) {
                params.append('nome', nomeFilter);
            }
            if (codigoFilter.trim()) {
                params.append('codigo', codigoFilter);
            }
            if (statusFilter.trim()) {
                params.append('status', statusFilter);
            }

            const response = await api.get(`/produtos?${params.toString()}`);
            
            if (response.data.content) {
                // Resposta paginada
                setPaginationData(response.data);
                setProducts(response.data.content);
            } else if (Array.isArray(response.data)) {
                // Resposta não paginada (compatibilidade)
                setProducts(response.data);
                setPaginationData({
                    content: response.data,
                    page: 0,
                    size: response.data.length,
                    totalElements: response.data.length,
                    totalPages: 1,
                    first: true,
                    last: true
                });
            } else {
                setError(response.data?.error || 'Erro desconhecido ao carregar produtos');
                setProducts([]);
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError('Erro ao carregar produtos: ' + err.response.data.message);
            } else {
                setError('Erro ao conectar com o servidor');
            }
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const getStatusBadge = (status) => {
        return status === 'ATIVO' ? 
            <Badge bg="success">{status}</Badge> : 
            <Badge bg="secondary">{status}</Badge>;
    };

    // Preview do produto - Removido, agora usa página dedicada

    // Ativar/Inativar produto
    const handleActivate = async (id) => {
        try {
            await activateProduct(id);
            alert("Produto ativado com sucesso!");
            fetchProducts();
        } catch (error) {
            console.error(error);
            alert("Erro ao ativar produto.");
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await deactivateProduct(id);
            alert("Produto inativado com sucesso!");
            fetchProducts();
        } catch (error) {
            console.error(error);
            alert("Erro ao inativar produto.");
        }
    };

    const handleEditQuantidade = (product) => {
        setSelectedProduct(product);
        setShowQuantidadeModal(true);
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setShowEditModal(true);
    };

    // Funções de filtro
    const handleFiltroChange = (tipo, valor) => {
        if (tipo === 'nome') {
            setFiltroNome(valor);
        } else if (tipo === 'codigo') {
            setFiltroCodigo(valor);
        } else if (tipo === 'status') {
            setFiltroStatus(valor);
        }
        setCurrentPage(0); // Reset para primeira página ao filtrar
    };

    const handleBuscar = () => {
        setCurrentPage(0);
        fetchProducts(filtroNome, filtroCodigo, filtroStatus, 0, pageSize);
    };

    const handleLimparFiltros = () => {
        setFiltroNome('');
        setFiltroCodigo('');
        setFiltroStatus('');
        setCurrentPage(0);
        fetchProducts('', '', '', 0, pageSize);
    };

    // Funções de paginação
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchProducts(filtroNome, filtroCodigo, filtroStatus, page, pageSize);
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(0);
        fetchProducts(filtroNome, filtroCodigo, filtroStatus, 0, newSize);
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </Spinner>
                <p className="mt-2">Carregando produtos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Erro!</Alert.Heading>
                <p>{error}</p>
            </Alert>
        );
    }

    return (
        <div>
            <Row className="mb-3">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>📊 Resumo</Card.Title>
                            <Row>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-primary">{paginationData.totalElements}</h4>
                                        <small className="text-muted">Total de Produtos</small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-success">
                                            {products.filter(p => p.status === 'ATIVO').length}
                                        </h4>
                                        <small className="text-muted">Ativos nesta Página</small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-info">
                                            {products.reduce((sum, p) => sum + p.quantidadeEstoque, 0)}
                                        </h4>
                                        <small className="text-muted">Estoque nesta Página</small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-warning">
                                            {formatPrice(products.reduce((sum, p) => sum + (p.preco * p.quantidadeEstoque), 0))}
                                        </h4>
                                        <small className="text-muted">Valor desta Página</small>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filtros */}
            <Card className="mb-3">
                <Card.Header>
                    <h6 className="mb-0">🔍 Filtros de Busca</h6>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Nome do Produto</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar por nome..."
                                    value={filtroNome}
                                    onChange={(e) => handleFiltroChange('nome', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Código</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="ID do produto"
                                    value={filtroCodigo}
                                    onChange={(e) => handleFiltroChange('codigo', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={filtroStatus}
                                    onChange={(e) => handleFiltroChange('status', e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Itens por página</Form.Label>
                                <Form.Select
                                    value={pageSize}
                                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3} className="d-flex align-items-end">
                            <div className="d-flex gap-2">
                                <Button variant="primary" onClick={handleBuscar} size="sm">
                                    🔍 Buscar
                                </Button>
                                <Button variant="outline-secondary" onClick={handleLimparFiltros} size="sm">
                                    🗑️ Limpar
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Lista de Produtos</h5>
                    <Button 
                        variant="primary" 
                        onClick={() => setShowCadastroModal(true)}
                        size="sm"
                    >
                        + Novo Produto
                    </Button>
                </Card.Header>
                <Card.Body>
                    <div className="table-responsive">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nome</th>
                                    <th>Qtd Estoque</th>
                                    <th>Preço</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(products) && products.length > 0 ? (
                                    products.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <strong className="text-primary">#{product.id}</strong>
                                            </td>
                                            <td>
                                                <div>
                                                    <strong>{product.nome}</strong>
                                                    {product.descricao && (
                                                        <>
                                                            <br />
                                                            <small className="text-muted">
                                                                {product.descricao.length > 40 
                                                                    ? product.descricao.substring(0, 40) + '...'
                                                                    : product.descricao
                                                                }
                                                            </small>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    product.quantidadeEstoque > 10 ? 'bg-success' :
                                                    product.quantidadeEstoque > 5 ? 'bg-warning' : 'bg-danger'
                                                }`}>
                                                    {product.quantidadeEstoque}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="fw-bold text-success">
                                                    {formatPrice(product.preco)}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(product.status)}</td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1">
                                                    <Button 
                                                        variant="info" 
                                                        size="sm" 
                                                        onClick={() => window.open(`/produto/${product.id}`, '_blank')}
                                                        title="Ver detalhes do produto"
                                                    >
                                                        👁️
                                                    </Button>
                                                    <Button 
                                                        variant="warning" 
                                                        size="sm" 
                                                        title={isAdmin() ? "Editar produto (dados + imagens)" : "Apenas administradores podem editar produtos"}
                                                        onClick={() => isAdmin() && handleEditProduct(product)}
                                                        disabled={!isAdmin()}
                                                        className={!isAdmin() ? 'bg-light' : ''}
                                                    >
                                                        ✏️
                                                    </Button>
                                                    {product.status === "ATIVO" ? (
                                                        <Button 
                                                            variant="secondary" 
                                                            size="sm" 
                                                            onClick={() => isAdmin() && handleDeactivate(product.id)}
                                                            title={isAdmin() ? "Inativar produto" : "Apenas administradores podem inativar produtos"}
                                                            disabled={!isAdmin()}
                                                            className={!isAdmin() ? 'bg-light' : ''}
                                                        >
                                                            ⏸️
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            variant="success" 
                                                            size="sm" 
                                                            onClick={() => isAdmin() && handleActivate(product.id)}
                                                            title={isAdmin() ? "Ativar produto" : "Apenas administradores podem ativar produtos"}
                                                            disabled={!isAdmin()}
                                                            className={!isAdmin() ? 'bg-light' : ''}
                                                        >
                                                            ▶️
                                                        </Button>
                                                    )}
                                                    {(isAdmin() || isEstoquista()) && (
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleEditQuantidade(product)}
                                                            title="Alterar quantidade em estoque"
                                                        >
                                                            📦
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center">
                                            Nenhum produto encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                    
                    {/* Paginação */}
                    {paginationData.totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <div className="text-muted">
                                Mostrando {paginationData.content.length} de {paginationData.totalElements} produtos
                                (Página {paginationData.page + 1} de {paginationData.totalPages})
                            </div>
                            <Pagination>
                                <Pagination.First 
                                    onClick={() => handlePageChange(0)} 
                                    disabled={paginationData.first}
                                />
                                <Pagination.Prev 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={paginationData.first}
                                />
                                
                                {/* Páginas */}
                                {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (paginationData.totalPages <= 5) {
                                        pageNum = i;
                                    } else if (currentPage <= 2) {
                                        pageNum = i;
                                    } else if (currentPage >= paginationData.totalPages - 3) {
                                        pageNum = paginationData.totalPages - 5 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <Pagination.Item
                                            key={pageNum}
                                            active={pageNum === currentPage}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum + 1}
                                        </Pagination.Item>
                                    );
                                })}
                                
                                <Pagination.Next 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={paginationData.last}
                                />
                                <Pagination.Last 
                                    onClick={() => handlePageChange(paginationData.totalPages - 1)} 
                                    disabled={paginationData.last}
                                />
                            </Pagination>
                        </div>
                    )}
                </Card.Body>
            </Card>
            
            {/* Modal de Cadastro */}
            <ProductCadastroModal
                show={showCadastroModal}
                onHide={() => setShowCadastroModal(false)}
                onSuccess={fetchProducts}
            />

            {/* Modal de Edição */}
            <ProductEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                product={selectedProduct}
                onProductUpdated={fetchProducts}
            />

            {/* Product Preview - Removido, agora usa página dedicada */}
            
            {/* Modal de Edição de Quantidade */}
            <ProductQuantidadeModal
                show={showQuantidadeModal}
                onHide={() => setShowQuantidadeModal(false)}
                product={selectedProduct}
                onSuccess={fetchProducts}
            />
        </div>
    );
};

export default ProductList;
