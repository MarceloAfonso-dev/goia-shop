import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import api from '../utils/api';
import './ProductPreview.css';

const ProductPreview = ({ productId, onClose }) => {
    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imageFit, setImageFit] = useState('contain'); // 'contain' ou 'cover'

    useEffect(() => {
        if (productId) {
            fetchProductData();
        }
    }, [productId]);

    const fetchProductData = async () => {
        try {
            setLoading(true);
            setError('');

            // Buscar dados do produto
            const productResponse = await api.get(`/produtos/${productId}`);
            setProduct(productResponse.data);

            // Buscar imagens do produto
            const imagesResponse = await api.get(`/produtos/${productId}/images`);
            setImages(imagesResponse.data);

        } catch (err) {
            console.error('Erro ao carregar produto:', err);
            setError('Erro ao carregar dados do produto');
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

    const renderStars = (rating) => {
        if (!rating) return <span className="text-muted">Sem avaliação</span>;
        
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="star">⭐</span>);
        }

        if (hasHalfStar) {
            stars.push(<span key="half" className="star">✨</span>);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
        }

        return (
            <div className="rating">
                {stars}
                <span className="rating-text">({rating.toFixed(1)})</span>
            </div>
        );
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };

    if (loading) {
        return (
            <div className="product-preview-overlay">
                <div className="product-preview-container">
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </Spinner>
                        <p className="mt-2">Carregando produto...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-preview-overlay">
                <div className="product-preview-container">
                    <Alert variant="danger">
                        <Alert.Heading>Erro!</Alert.Heading>
                        <p>{error || 'Produto não encontrado'}</p>
                        <Button variant="secondary" onClick={onClose}>
                            Fechar
                        </Button>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="product-preview-overlay">
            <div className="product-preview-container">
                <div className="product-preview-header">
                    <h2>👁️ Preview do Produto</h2>
                    <Button variant="outline-secondary" onClick={onClose}>
                        ✕ Fechar Preview
                    </Button>
                </div>

                <Container fluid className="product-preview-content">
                    <Row>
                        {/* Galeria de Imagens */}
                        <Col lg={6} className="image-gallery">
                            <div className="main-image-container">
                                {images.length > 0 ? (
                                    <>
                                        <img
                                            src={images[currentImageIndex]?.urlArquivo}
                                            alt={product.nome}
                                            className="main-image"
                                            style={{ objectFit: imageFit }}
                                            loading="eager"
                                            decoding="sync"
                                        />
                                        {images.length > 1 && (
                                            <>
                                                <button 
                                                    className="carousel-btn prev-btn"
                                                    onClick={prevImage}
                                                >
                                                    ‹
                                                </button>
                                                <button 
                                                    className="carousel-btn next-btn"
                                                    onClick={nextImage}
                                                >
                                                    ›
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="no-image-placeholder">
                                        <span>📷</span>
                                        <p>Sem imagem disponível</p>
                                    </div>
                                )}
                                
                                {/* Controles de visualização da imagem */}
                                {images.length > 0 && (
                                    <div className="image-controls">
                                        <Button
                                            variant={imageFit === 'contain' ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            onClick={() => setImageFit('contain')}
                                            title="Ajustar imagem ao container (sem cortar)"
                                        >
                                            📐 Ajustar
                                        </Button>
                                        <Button
                                            variant={imageFit === 'cover' ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            onClick={() => setImageFit('cover')}
                                            title="Preencher container (pode cortar)"
                                        >
                                            🔍 Preencher
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="thumbnails">
                                    {images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image.urlArquivo}
                                            alt={`${product.nome} ${index + 1}`}
                                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => goToImage(index)}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ))}
                                </div>
                            )}
                        </Col>

                        {/* Informações do Produto */}
                        <Col lg={6} className="product-info">
                            <div className="product-details">
                                <h1 className="product-name">{product.nome}</h1>
                                
                                <div className="product-rating">
                                    {renderStars(product.avaliacao)}
                                </div>

                                <div className="product-price">
                                    <span className="price">{formatPrice(product.preco)}</span>
                                    <Badge 
                                        bg={product.status === 'ATIVO' ? 'success' : 'secondary'}
                                        className="status-badge"
                                    >
                                        {product.status}
                                    </Badge>
                                </div>

                                <div className="product-description">
                                    <h3>Descrição</h3>
                                    <p>{product.descricao || 'Nenhuma descrição disponível.'}</p>
                                </div>

                                <div className="product-stock">
                                    <p>
                                        <strong>Estoque:</strong> 
                                        <span className={`stock-amount ${product.quantidadeEstoque > 10 ? 'high' : product.quantidadeEstoque > 5 ? 'medium' : 'low'}`}>
                                            {product.quantidadeEstoque} unidades
                                        </span>
                                    </p>
                                </div>

                                <div className="product-actions">
                                    <Button 
                                        variant="primary" 
                                        size="lg" 
                                        disabled
                                        className="buy-button"
                                    >
                                        🛒 Comprar (Desabilitado)
                                    </Button>
                                    <p className="buy-note">
                                        <small className="text-muted">
                                            Este é um preview - funcionalidade de compra não implementada
                                        </small>
                                    </p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default ProductPreview;
