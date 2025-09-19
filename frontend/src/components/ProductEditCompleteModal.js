import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Spinner, Card, Badge, Image } from 'react-bootstrap';
import api from '../utils/api';

const ProductEditModal = ({ show, onHide, product, onProductUpdated }) => {
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
    const [newImagePreviews, setNewImagePreviews] = useState([]);

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
            // Validar tipos de arquivo
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const invalidFiles = files.filter(file => !validTypes.includes(file.type));
            
            if (invalidFiles.length > 0) {
                setError('Apenas imagens (JPEG, PNG, GIF, WebP) são permitidas');
                return;
            }
            
            // Validar tamanho (5MB por arquivo)
            const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
            
            if (oversizedFiles.length > 0) {
                setError('Cada imagem deve ter no máximo 5MB');
                return;
            }

            // Verificar se não excede 5 imagens totais (existentes + novas)
            const totalImages = imagens.length + newImagePreviews.length + files.length;
            if (totalImages > 5) {
                setError(`Máximo 5 imagens permitidas. Você já tem ${imagens.length + newImagePreviews.length} imagens.`);
                return;
            }

            setNewImages(prev => [...prev, ...files]);
            
            // Criar previews para as novas imagens
            const newPreviews = files.map((file, index) => ({
                id: `new_${Date.now()}_${index}`,
                file: file,
                url: URL.createObjectURL(file),
                nomeArquivo: file.name,
                isPrincipal: (imagens.length === 0 && newImagePreviews.length === 0 && index === 0), // Primeira imagem é principal se não há outras
                ordem: imagens.length + newImagePreviews.length + index,
                isNew: true
            }));
            
            setNewImagePreviews(prev => [...prev, ...newPreviews]);
            setError('');
        }
    };

    // Função para obter todas as imagens (existentes + novas) em ordem
    const getAllImages = () => {
        const existingImages = imagens.map(img => ({ ...img, isNew: false }));
        const newImagesWithFlag = newImagePreviews.map(img => ({ ...img, isNew: true }));
        return [...existingImages, ...newImagesWithFlag].sort((a, b) => a.ordem - b.ordem);
    };

    // Função para atualizar uma imagem específica
    const updateImage = (imageId, updates) => {
        setImagens(prev => prev.map(img => 
            img.id === imageId ? { ...img, ...updates } : img
        ));
        setNewImagePreviews(prev => prev.map(img => 
            img.id === imageId ? { ...img, ...updates } : img
        ));
    };

    // Função para remover uma imagem (existente ou nova)
    const removeImage = (imageId, isNew) => {
        if (isNew) {
            // Remover das novas imagens
            const imageToRemove = newImagePreviews.find(img => img.id === imageId);
            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.url); // Limpar URL do blob
                setNewImagePreviews(prev => prev.filter(img => img.id !== imageId));
                setNewImages(prev => prev.filter(file => file.name !== imageToRemove.nomeArquivo));
                
                // Reordenar as imagens restantes
                reorderAllImages();
            }
        } else {
            // Remover imagem existente (mesma lógica anterior)
            handleRemoveImage(imageId);
        }
    };

    // Função para reordenar todas as imagens
    const reorderAllImages = () => {
        const allImages = getAllImages();
        
        allImages.forEach((img, index) => {
            updateImage(img.id, { ordem: index });
        });
        
        // Se não há imagem principal, definir a primeira como principal
        if (allImages.length > 0 && !allImages.some(img => img.isPrincipal)) {
            updateImage(allImages[0].id, { isPrincipal: true });
        }
    };

    // Função para mover imagem (funciona para existentes e novas)
    const moveImage = (fromIndex, toIndex) => {
        const allImages = getAllImages();
        const [movedImage] = allImages.splice(fromIndex, 1);
        allImages.splice(toIndex, 0, movedImage);
        
        // Atualizar ordem de todas as imagens
        allImages.forEach((img, index) => {
            updateImage(img.id, { ordem: index });
        });
    };

    // Função para definir imagem como principal (funciona para existentes e novas)
    const setMainImage = (imageId) => {
        const allImages = getAllImages();
        
        // Remover principal de todas as imagens
        allImages.forEach(img => {
            updateImage(img.id, { isPrincipal: false });
        });
        
        // Definir a nova principal
        updateImage(imageId, { isPrincipal: true });
        
        // Mover para primeira posição
        const targetImage = allImages.find(img => img.id === imageId);
        if (targetImage) {
            const currentIndex = allImages.findIndex(img => img.id === imageId);
            moveImage(currentIndex, 0);
        }
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
            // Validações (melhoradas do modal básico)
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

            // Preparar dados do produto com todas as imagens (existentes + novas)
            const allImages = getAllImages();
            const existingImages = allImages.filter(img => !img.isNew);
            const newImagesInOrder = allImages.filter(img => img.isNew);

            const productData = {
                nome: formData.nome.trim(),
                descricao: formData.descricao.trim(),
                preco: parseFloat(formData.preco),
                quantidadeEstoque: parseInt(formData.quantidadeEstoque),
                avaliacao: formData.avaliacao ? parseFloat(formData.avaliacao) : null,
                status: formData.status,
                imagens: existingImages.map((img, index) => ({
                    imagemId: img.id,
                    ordem: img.ordem,
                    isPrincipal: img.isPrincipal
                }))
            };

            // Upload de novas imagens na ordem correta
            if (newImagesInOrder.length > 0) {
                setUploadingImages(true);
                
                for (let i = 0; i < newImagesInOrder.length; i++) {
                    const imageData = newImagesInOrder[i];
                    const file = newImages.find(f => f.name === imageData.nomeArquivo);
                    
                    if (file) {
                        const formDataImg = new FormData();
                        formDataImg.append('file', file);
                        formDataImg.append('isPrincipal', imageData.isPrincipal ? 'true' : 'false');
                        formDataImg.append('ordem', imageData.ordem.toString());

                        await api.post(`/produtos/${product.id}/images`, formDataImg);
                    }
                }
                setUploadingImages(false);
            }

            // Atualizar produto com dados básicos e reordenação das imagens existentes
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

    const handleClose = () => {
        // Prevenir fechamento acidental durante upload
        if (loading || uploadingImages) {
            return;
        }
        
        // Limpar URLs dos blobs das novas imagens
        newImagePreviews.forEach(img => {
            if (img.url) {
                URL.revokeObjectURL(img.url);
            }
        });
        
        // Reset do formulário
        setFormData({
            nome: '',
            descricao: '',
            preco: '',
            quantidadeEstoque: '',
            avaliacao: '',
            status: 'ATIVO'
        });
        setImagens([]);
        setNewImages([]);
        setNewImagePreviews([]);
        setError('');
        onHide();
    };

    return (
        <Modal 
            show={show} 
            onHide={handleClose} 
            size="xl" 
            centered 
            backdrop="static"
            style={{ zIndex: 1050 }}
        >
            <Modal.Header closeButton>
                <Modal.Title>✏️ Editar Produto</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    {/* Informações do que pode ser editado */}
                    <Alert variant="info" className="mb-4">
                        <strong>📝 Neste modal você pode editar:</strong>
                        <ul className="mb-0 mt-2">
                            <li><strong>Dados básicos:</strong> Nome, descrição, preço, quantidade, avaliação e status</li>
                            <li><strong>Imagens:</strong> Adicionar novas, remover existentes, definir principal e reordenar</li>
                        </ul>
                    </Alert>
                    
                    {/* Informações Básicas */}
                    <h5>📋 Dados Básicos</h5>
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

                    {/* Gerenciamento de Imagens */}
                    <hr className="my-4" />
                    <h5>🖼️ Gerenciamento de Imagens</h5>
                    
                    {/* Upload de Novas Imagens */}
                    <Form.Group className="mb-4">
                        <Form.Label>📤 Adicionar Novas Imagens</Form.Label>
                        <Form.Control
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleImageUpload}
                        />
                        <Form.Text className="text-muted">
                            Selecione uma ou mais imagens. Formatos aceitos: JPEG, PNG, GIF, WebP (máx. 5MB cada)
                        </Form.Text>
                    </Form.Group>

                    {/* Lista de Todas as Imagens (Existentes + Novas) */}
                    {(imagens.length > 0 || newImagePreviews.length > 0) && (
                        <div className="mb-3">
                            <h6>📸 Imagens do Produto</h6>
                            <Alert variant="info" className="small mb-3">
                                <strong>💡 Como usar:</strong>
                                <ul className="mb-0 mt-1">
                                    <li>Clique em <strong>"⭐ Definir como Principal"</strong> para escolher a imagem de destaque</li>
                                    <li>Use ↑↓ para reordenar as imagens</li>
                                    <li>Clique no ❌ para remover uma imagem</li>
                                    <li><span className="badge bg-info">NOVA</span> indica imagens que serão adicionadas quando salvar</li>
                                </ul>
                            </Alert>
                            <Row className="g-3">
                                {getAllImages().map((imagem, index) => (
                                    <Col key={imagem.id} md={4} lg={3}>
                                        <Card className="h-100">
                                            <div className="position-relative">
                                                <Image
                                                    src={imagem.isNew ? imagem.url : imagem.urlArquivo}
                                                    alt={imagem.nomeArquivo}
                                                    style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                {/* Badge de Principal */}
                                                {imagem.isPrincipal && (
                                                    <Badge
                                                        bg="success"
                                                        className="position-absolute top-0 start-0 m-2"
                                                        style={{ fontSize: '0.8rem' }}
                                                    >
                                                        ⭐ PRINCIPAL
                                                    </Badge>
                                                )}
                                                {/* Badge de Nova Imagem */}
                                                {imagem.isNew && (
                                                    <Badge
                                                        bg="info"
                                                        className="position-absolute top-0 start-50 translate-middle-x m-2"
                                                        style={{ fontSize: '0.7rem' }}
                                                    >
                                                        NOVA
                                                    </Badge>
                                                )}
                                                {/* Botão Remover */}
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="position-absolute top-0 end-0 m-2"
                                                    onClick={() => removeImage(imagem.id, imagem.isNew)}
                                                    style={{ width: '30px', height: '30px', padding: '0' }}
                                                    title="Remover imagem"
                                                >
                                                    ❌
                                                </Button>
                                            </div>
                                            <Card.Body className="p-2">
                                                <small className="text-muted d-block mb-2" title={imagem.nomeArquivo}>
                                                    {imagem.nomeArquivo.length > 20 ? 
                                                        imagem.nomeArquivo.substring(0, 20) + '...' : 
                                                        imagem.nomeArquivo
                                                    }
                                                    {imagem.isNew && <span className="text-info"> (nova)</span>}
                                                </small>
                                                
                                                {/* Botão Principal - Redesenhado */}
                                                {!imagem.isPrincipal ? (
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        className="w-100 mb-2"
                                                        onClick={() => setMainImage(imagem.id)}
                                                    >
                                                        ⭐ Definir como Principal
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="w-100 mb-2"
                                                        disabled
                                                    >
                                                        ✅ Imagem Principal
                                                    </Button>
                                                )}
                                                
                                                {/* Botões de Ordenação */}
                                                <div className="d-flex gap-1 justify-content-center">
                                                    {index > 0 && (
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => moveImage(index, index - 1)}
                                                            title="Mover para cima"
                                                            style={{ flex: 1 }}
                                                        >
                                                            ↑
                                                        </Button>
                                                    )}
                                                    {index < getAllImages().length - 1 && (
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => moveImage(index, index + 1)}
                                                            title="Mover para baixo"
                                                            style={{ flex: 1 }}
                                                        >
                                                            ↓
                                                        </Button>
                                                    )}
                                                    {!imagem.isPrincipal && (
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => setMainImage(imagem.id)}
                                                            title="Mover para primeira posição e definir como principal"
                                                            style={{ flex: 1 }}
                                                        >
                                                            ⬆️ Topo
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading || uploadingImages}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading || uploadingImages}>
                        {loading || uploadingImages ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                {uploadingImages ? 'Enviando imagens...' : 'Salvando...'}
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
