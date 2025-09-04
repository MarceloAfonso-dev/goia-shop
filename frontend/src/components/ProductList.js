import React, { useState, useEffect } from 'react';
import { Table, Card, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import api from '../utils/api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                <Card.Header>
                    <h5 className="mb-0">Lista de Produtos</h5>
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
                                </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ProductList;
