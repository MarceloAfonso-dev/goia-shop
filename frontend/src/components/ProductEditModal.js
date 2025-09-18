import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api from '../utils/api';

const ProductEditModal = ({ show, onHide, product, onProductUpdated }) => {
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        preco: '',
        quantidadeEstoque: '',
        avaliacao: '',
        status: 'ATIVO'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Preenche o formulário quando o produto é carregado
    useEffect(() => {
        if (product) {
            setFormData({
                nome: product.nome || '',
                descricao: product.descricao || '',
                preco: product.preco || '',
                quantidadeEstoque: product.quantidadeEstoque || '',
                avaliacao: product.avaliacao || '',
                status: product.status || 'ATIVO'
            });
        }
    }, [product]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validações frontend
            if (!formData.nome.trim()) {
                throw new Error('Nome do produto é obrigatório');
            }
            
            if (!formData.preco || parseFloat(formData.preco) <= 0) {
                throw new Error('Preço deve ser maior que zero');
            }
            
            if (!formData.quantidadeEstoque || parseInt(formData.quantidadeEstoque) <= 0) {
                throw new Error('Quantidade em estoque deve ser maior que zero. Para zerar o estoque, use a opção de inativar o produto.');
            }
            
            if (formData.avaliacao && (parseFloat(formData.avaliacao) < 1 || parseFloat(formData.avaliacao) > 5)) {
                throw new Error('Avaliação deve estar entre 1 e 5');
            }

            // Preparar dados para envio
            const dadosEnvio = {
                nome: formData.nome.trim(),
                descricao: formData.descricao.trim(),
                preco: parseFloat(formData.preco),
                quantidadeEstoque: parseInt(formData.quantidadeEstoque),
                avaliacao: formData.avaliacao ? parseFloat(formData.avaliacao) : null,
                status: formData.status
            };

            await api.put(`/produtos/${product.id}`, dadosEnvio);
            
            setSuccess('Produto alterado com sucesso!');

            // Aguardar um pouco antes de fechar
            setTimeout(() => {
                onProductUpdated && onProductUpdated();
                onHide();
                setSuccess('');
            }, 2000);

        } catch (err) {
            if (err.response?.data) {
                setError(err.response.data);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            nome: '',
            descricao: '',
            preco: '',
            quantidadeEstoque: '',
            avaliacao: '',
            status: 'ATIVO'
        });
        setError('');
        setSuccess('');
        onHide();
    };

    if (!product) return null;

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>✏️ Editar Produto</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome do Produto *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Nome do produto"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Preço *</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    name="preco"
                                    value={formData.preco}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="0.00"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Descrição</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleInputChange}
                            placeholder="Descrição do produto"
                        />
                    </Form.Group>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Quantidade em Estoque *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="quantidadeEstoque"
                                            value={formData.quantidadeEstoque}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            placeholder="1"
                                        />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Avaliação</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="5"
                                    name="avaliacao"
                                    value={formData.avaliacao}
                                    onChange={handleInputChange}
                                    placeholder="1.0 - 5.0"
                                />
                                <Form.Text className="text-muted">
                                    Opcional - de 1 a 5
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Alert variant="info" className="small">
                        <strong>ℹ️ Informações:</strong>
                        <ul className="mb-0 mt-2">
                            <li>O ID do produto não pode ser alterado</li>
                            <li>As imagens do produto não são alteradas neste modal</li>
                            <li>Para alterar apenas a quantidade, use o botão "📦" na lista</li>
                        </ul>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Salvando...
                            </>
                        ) : (
                            '💾 Salvar Alterações'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ProductEditModal;
