import React, { useState, useEffect } from 'react';
import { Table, Card, Badge, Spinner, Alert, Row, Col, Button } from 'react-bootstrap';
import api from '../utils/api';
import ProductCadastroModal from './ProductCadastroModal';
import { useAuth } from '../hooks/useAuth';

//Task - Ativar/Inativar @gustavo
import { activateProduct, deactivateProduct } from "../utils/api";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCadastroModal, setShowCadastroModal] = useState(false);

    //Task - Ativar/Inativar
    const { isAdmin } = useAuth();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/produtos');
            setProducts(response.data);
        } catch (err) {
            if (err.response?.data?.message) {
                setError('Erro ao carregar produtos: ' + err.response.data.message);
            } else {
                setError('Erro ao conectar com o servidor');
            }
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

    const handleActivate = async (id) => {
        try {
            await activateProduct(id);
            alert("Produto inativado com sucesso!");
            fetchProducts(); // recarrega a lista
        } catch (error) {
            console.error(error);
            alert("Erro ao inativar produto.");
        }   
    };

    const handleDeactivate = async (id) => {
        try {
            await deactivateProduct(id);
            alert("Produto ativado com sucesso!");
            fetchProducts(); // recarrega a lista
        } catch (error) {
            console.error(error);
            alert("Erro ao ativar produto.");
        }
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
                                        <h4 className="text-primary">{products.length}</h4>
                                        <small className="text-muted">Total de Produtos</small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-success">
                                            {products.filter(p => p.status === 'ATIVO').length}
                                        </h4>
                                        <small className="text-muted">Produtos Ativos</small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-info">
                                            {products.reduce((sum, p) => sum + p.quantidadeEstoque, 0)}
                                        </h4>
                                        <small className="text-muted">Total em Estoque</small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-warning">
                                            {formatPrice(products.reduce((sum, p) => sum + (p.preco * p.quantidadeEstoque), 0))}
                                        </h4>
                                        <small className="text-muted">Valor Total</small>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

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
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Descrição</th>
                                    <th>Preço</th>
                                    <th>Estoque</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>
                                            <strong>{product.nome}</strong>
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {product.descricao.length > 50 
                                                    ? product.descricao.substring(0, 50) + '...'
                                                    : product.descricao
                                                }
                                            </small>
                                        </td>
                                        <td>
                                            <span className="fw-bold text-success">
                                                {formatPrice(product.preco)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                product.quantidadeEstoque > 10 ? 'bg-success' :
                                                product.quantidadeEstoque > 5 ? 'bg-warning' : 'bg-danger'
                                            }`}>
                                                {product.quantidadeEstoque}
                                            </span>
                                        </td>
                                        <td>{getStatusBadge(product.status)}</td>
                                        <td>
                                            {isAdmin && (
                                                <>
                                                    {product.status === "ATIVO" ? (
                                                        <Button 
                                                            variant="secondary" 
                                                            size="sm" 
                                                            onClick={() => handleDeactivate(product.id)}
                                                        >
                                                            Inativar
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            variant="success" 
                                                            size="sm" 
                                                            onClick={() => handleActivate(product.id)}
                                                        >
                                                            Ativar
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
            
            {/* Modal de Cadastro */}
            <ProductCadastroModal
                show={showCadastroModal}
                onHide={() => setShowCadastroModal(false)}
                onSuccess={fetchProducts}
            />
        </div>
    );
};

export default ProductList;
