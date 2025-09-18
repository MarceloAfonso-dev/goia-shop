import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Spinner, Card, Badge, Image } from 'react-bootstrap';
import api from '../utils/api';

const ProductEditCompleteModal = ({ show, onHide, product, onProductUpdated }) => {
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        preco: '',
        quantidadeEstoque: '',
        avaliacao: '',
        status: ''
    });
    const [imagens, setImagens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadingImages, setUploadingImages] = useState(false);
    const [newImages, setNewImages] = useState([]);

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
            
            // Carregar imagens do produto
            if (product.imagens && product.imagens.length > 0) {
                setImagens(product.imagens);
            } else {
                setImagens([]);
            }
        }
    }, [product]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setNewImages(files);
        }
    };

    const handleMoveImage = (fromIndex, toIndex) => {
        const items = Array.from(imagens);
        const [reorderedItem] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, reorderedItem);

        // Atualizar ordem das imagens
        const updatedImages = items.map((img, index) => ({
            ...img,
            ordem: index
        }));

        setImagens(updatedImages);
    };

    const handleMoveToFirst = (imagemId) => {
        const mainImage = imagens.find(img => img.id === imagemId);
        if (!mainImage) return;

        // Mover para primeira posição e definir como principal
        const otherImages = imagens.filter(img => img.id !== imagemId);
        const updatedImages = [
            { ...mainImage, isPrincipal: true, ordem: 0 },
            ...otherImages.map((img, index) => ({
                ...img,
                isPrincipal: false,
                ordem: index + 1
            }))
        ];
        
        setImagens(updatedImages);
    };

    const handleSetMainImage = (imagemId) => {
        // Encontrar a imagem que será definida como principal
        const mainImage = imagens.find(img => img.id === imagemId);
        if (!mainImage) return;

        // Reordenar: imagem principal vai para primeira posição
        const otherImages = imagens.filter(img => img.id !== imagemId);
        const updatedImages = [
            { ...mainImage, isPrincipal: true, ordem: 0 },
            ...otherImages.map((img, index) => ({
                ...img,
                isPrincipal: false,
                ordem: index + 1
            }))
        ];
        
        setImagens(updatedImages);
    };

    const handleRemoveImage = async (imagemId) => {
        if (!window.confirm('Tem certeza que deseja remover esta imagem?')) {
            return;
        }

        try {
            await api.delete(`/produtos/${product.id}/imagens/${imagemId}`);
            
            // Remover da lista local
            const updatedImages = imagens.filter(img => img.id !== imagemId);
            
            // Se era a imagem principal, definir a primeira como principal e reordenar
            if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrincipal)) {
                const reorderedImages = updatedImages.map((img, index) => ({
                    ...img,
                    isPrincipal: index === 0,
                    ordem: index
                }));
                setImagens(reorderedImages);
            } else {
                // Reordenar as imagens restantes
                const reorderedImages = updatedImages.map((img, index) => ({
                    ...img,
                    ordem: index
                }));
                setImagens(reorderedImages);
            }
        } catch (err) {
            setError('Erro ao remover imagem: ' + (err.response?.data || err.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validações
            if (!formData.nome.trim()) {
                throw new Error('Nome do produto é obrigatório');
            }
            if (!formData.preco || parseFloat(formData.preco) <= 0) {
                throw new Error('Preço deve ser maior que zero');
            }
            if (!formData.quantidadeEstoque || parseInt(formData.quantidadeEstoque) <= 0) {
                throw new Error('Quantidade em estoque deve ser maior que zero');
            }
            if (formData.avaliacao && (parseFloat(formData.avaliacao) < 1 || parseFloat(formData.avaliacao) > 5)) {
                throw new Error('Avaliação deve estar entre 1 e 5');
            }

            // Preparar dados do produto
            const productData = {
                nome: formData.nome.trim(),
                descricao: formData.descricao.trim(),
                preco: parseFloat(formData.preco),
                quantidadeEstoque: parseInt(formData.quantidadeEstoque),
                avaliacao: formData.avaliacao ? parseFloat(formData.avaliacao) : null,
                status: formData.status,
                imagens: imagens.map((img, index) => ({
                    imagemId: img.id,
                    ordem: index,
                    isPrincipal: img.isPrincipal
                }))
            };

            // Upload de novas imagens primeiro
            if (newImages.length > 0) {
                setUploadingImages(true);
                const formData = new FormData();
                newImages.forEach(file => {
                    formData.append('arquivos', file);
                });

                await api.post(`/produtos/${product.id}/imagens`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setUploadingImages(false);
            }

            // Atualizar produto
            await api.put(`/produtos/${product.id}/completo`, productData);

            onProductUpdated();
            onHide();

        } catch (err) {
            setError(err.response?.data || err.message || 'Erro ao atualizar produto');
            setUploadingImages(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>✏️ Editar Produto Completo</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    {/* Informações Básicas */}
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
                                />
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

                    {/* Gerenciamento de Imagens */}
                    <hr />
                    <h5>🖼️ Gerenciamento de Imagens</h5>
                    
                    {/* Upload de Novas Imagens */}
                    <Form.Group className="mb-3">
                        <Form.Label>Adicionar Novas Imagens</Form.Label>
                        <Form.Control
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <Form.Text className="text-muted">
                            Selecione uma ou mais imagens para adicionar ao produto
                        </Form.Text>
                    </Form.Group>

                    {/* Lista de Imagens Existentes */}
                    {imagens.length > 0 && (
                        <div className="mb-3">
                            <h6>Imagens do Produto</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {imagens.map((imagem, index) => (
                                    <Card
                                        key={imagem.id}
                                        className="position-relative"
                                        style={{ width: '120px', height: '120px' }}
                                    >
                                        <Image
                                            src={imagem.urlArquivo}
                                            alt={imagem.nomeArquivo}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        {imagem.isPrincipal && (
                                            <Badge
                                                bg="primary"
                                                className="position-absolute top-0 start-0 m-1"
                                            >
                                                Principal
                                            </Badge>
                                        )}
                                        <div className="position-absolute top-0 end-0 m-1">
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleRemoveImage(imagem.id)}
                                                style={{ padding: '2px 6px' }}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                        <div className="position-absolute bottom-0 start-0 end-0 p-1">
                                            <div className="d-flex gap-1 justify-content-center">
                                                <Button
                                                    variant={imagem.isPrincipal ? "success" : "outline-primary"}
                                                    size="sm"
                                                    onClick={() => handleSetMainImage(imagem.id)}
                                                    style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                                                >
                                                    {imagem.isPrincipal ? 'Principal' : 'Definir Principal'}
                                                </Button>
                                                {!imagem.isPrincipal && (
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        onClick={() => handleMoveToFirst(imagem.id)}
                                                        style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                                                        title="Mover para primeira posição e definir como principal"
                                                    >
                                                        ⬆️
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        {/* Botões de ordenação */}
                                        <div className="position-absolute start-0 top-50 translate-middle-y">
                                            {index > 0 && (
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleMoveImage(index, index - 1)}
                                                    style={{ padding: '1px 4px', fontSize: '0.6rem' }}
                                                >
                                                    ↑
                                                </Button>
                                            )}
                                        </div>
                                        <div className="position-absolute end-0 top-50 translate-middle-y">
                                            {index < imagens.length - 1 && (
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleMoveImage(index, index + 1)}
                                                    style={{ padding: '1px 4px', fontSize: '0.6rem' }}
                                                >
                                                    ↓
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                            <small className="text-muted">
                                💡 Use os botões ↑↓ para reordenar as imagens. Clique em "Definir Principal" para escolher a imagem principal (ela irá automaticamente para a primeira posição). Use ⬆️ para mover uma imagem para o topo e definir como principal.
                            </small>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading || uploadingImages}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading || uploadingImages}>
                        {loading || uploadingImages ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                {uploadingImages ? 'Enviando imagens...' : 'Salvando...'}
                            </>
                        ) : (
                            'Salvar Alterações'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ProductEditCompleteModal;
