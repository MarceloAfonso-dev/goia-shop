import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../utils/api';

const ProductQuantidadeModal = ({ show, onHide, product, onSuccess }) => {
    const [quantidade, setQuantidade] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Atualizar quantidade quando o produto mudar
    React.useEffect(() => {
        if (product) {
            setQuantidade(product.quantidadeEstoque || 0);
            setError('');
        }
    }, [product]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (quantidade < 0) {
            setError('A quantidade não pode ser negativa');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            await api.put(`/produtos/${product.id}/quantidade`, {
                quantidadeEstoque: quantidade
            });
            
            onSuccess();
            onHide();
            
        } catch (err) {
            if (err.response?.data) {
                setError(err.response.data);
            } else {
                setError('Erro ao alterar quantidade do produto');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        setQuantidade(product?.quantidadeEstoque || 0);
        onHide();
    };

    if (!product) return null;

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Alterar Quantidade em Estoque</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="mb-3">
                        <h6>Produto: <strong>{product.nome}</strong></h6>
                        <p className="text-muted mb-0">ID: {product.id}</p>
                    </div>
                    
                    {error && (
                        <Alert variant="danger" className="mb-3">
                            {error}
                        </Alert>
                    )}
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Nova Quantidade em Estoque</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            value={quantidade}
                            onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
                            placeholder="Digite a nova quantidade"
                            required
                        />
                        <Form.Text className="text-muted">
                            Quantidade atual: <strong>{product.quantidadeEstoque}</strong>
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Salvando...
                            </>
                        ) : (
                            'Salvar Alteração'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ProductQuantidadeModal;
