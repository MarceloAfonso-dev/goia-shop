import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EcommerceHeader from './EcommerceHeader';
import { useCart } from '../hooks/useCart';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, getProductQuantity } = useCart();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProdutoDetalhes();
  }, [id]);

  const fetchProdutoDetalhes = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`http://localhost:8080/api/produtos/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Produto não encontrado');
        }
        throw new Error('Erro ao carregar produto');
      }

      const data = await response.json();
      setProduto(data);
      setCurrentImageIndex(0);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      setError(error.message || 'Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Se já é uma URL completa, usar diretamente
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Caso contrário, construir a URL
    return `http://localhost:8080/uploads/${imagePath}`;
  };

  const getMainImage = () => {
    if (!produto?.imagens || produto.imagens.length === 0) return null;
    
    // Procura pela imagem principal
    const mainImage = produto.imagens.find(img => img.isPrincipal === true || img.isPrincipal === 1);
    if (mainImage) {
      // Prioriza urlArquivo se disponível, senão usa caminhoArquivo
      return getImageUrl(mainImage.urlArquivo || mainImage.caminhoArquivo);
    }
    
    // Se não encontrar, usa a primeira imagem
    const firstImage = produto.imagens[0];
    return getImageUrl(firstImage.urlArquivo || firstImage.caminhoArquivo);
  };

  const getAllImages = () => {
    if (!produto?.imagens) return [];
    return produto.imagens
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0)) // Ordenar por ordem
      .map(img => getImageUrl(img.urlArquivo || img.caminhoArquivo))
      .filter(Boolean);
  };

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (produto?.quantidade || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!produto) return;
    
    setAddingToCart(true);
    try {
      addToCart(produto, quantity);
      
      // Feedback visual
      setTimeout(() => {
        setAddingToCart(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!produto) return;
    
    // Adicionar ao carrinho
    addToCart(produto, quantity);
    
    // Navegar para checkout/carrinho
    navigate('/carrinho');
  };

  const handleBackToProducts = () => {
    navigate('/produtos');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="ecommerce-page">
        <EcommerceHeader />
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <h3>Carregando produto...</h3>
        </div>
      </div>
    );
  }

  if (error || !produto) {
    return (
      <div className="ecommerce-page">
        <EcommerceHeader />
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Produto não encontrado</h3>
          <p>{error || 'O produto solicitado não foi encontrado.'}</p>
          <button className="btn-back" onClick={handleBackToProducts}>
            Voltar aos Produtos
          </button>
        </div>
      </div>
    );
  }

  const allImages = getAllImages();
  const currentImage = allImages[currentImageIndex] || getMainImage();

  return (
    <div className="ecommerce-page">
      <EcommerceHeader />
      
      <div className="product-detail-container">
        <div className="breadcrumb">
          <button className="breadcrumb-link" onClick={handleBackToProducts}>
            ← Voltar aos Produtos
          </button>
        </div>

        <div className="product-detail-content">
          {/* Galeria de Imagens */}
          <div className="product-gallery">
            <div className="main-image-container">
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt={produto.nome}
                  className="main-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="image-placeholder" style={{ display: currentImage ? 'none' : 'flex' }}>
                <span>📦</span>
                <p>Imagem não disponível</p>
              </div>
            </div>
            
            {allImages.length > 1 && (
              <div className="image-thumbnails">
                {allImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => handleImageChange(index)}
                  >
                    <img src={imageUrl} alt={`${produto.nome} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="product-info-detail">
            <div className="product-header">
              <h1 className="product-title">{produto.nome}</h1>
              <div className="product-rating">
                <span className="stars">⭐⭐⭐⭐⭐</span>
                <span className="rating-count">(4.5)</span>
              </div>
            </div>

            <div className="product-price-section">
              <div className="price-main">{formatPrice(produto.preco)}</div>
              {produto.precoDesconto && produto.precoDesconto < produto.preco && (
                <div className="price-original">{formatPrice(produto.precoDesconto)}</div>
              )}
            </div>

            {produto.descricao && (
              <div className="product-description">
                <h3>Descrição</h3>
                <p>{produto.descricao}</p>
              </div>
            )}

            <div className="product-details">
              <div className="detail-item">
                <strong>Categoria:</strong>
                <span>{produto.categoria?.nome || 'Geral'}</span>
              </div>
              <div className="detail-item">
                <strong>Disponibilidade:</strong>
                <span className={produto.quantidade > 0 ? 'in-stock' : 'out-of-stock'}>
                  {produto.quantidade > 0 ? `${produto.quantidade} em estoque` : 'Fora de estoque'}
                </span>
              </div>
              {isInCart(produto.id) && (
                <div className="detail-item">
                  <strong>No carrinho:</strong>
                  <span className="in-cart">
                    {getProductQuantity(produto.id)} unidade{getProductQuantity(produto.id) > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {produto.quantidade > 0 && (
              <div className="purchase-section">
                <div className="quantity-selector">
                  <label>Quantidade:</label>
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= produto.quantidade}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="purchase-buttons">
                  <button 
                    className="btn-add-cart" 
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? '⏳ Adicionando...' : (isInCart(produto.id) ? '✅ Adicionar Mais' : '🛒 Adicionar ao Carrinho')}
                  </button>
                  <button 
                    className="btn-buy-now"
                    onClick={handleBuyNow}
                  >
                    💳 Comprar Agora
                  </button>
                </div>
              </div>
            )}

            {produto.quantidade === 0 && (
              <div className="out-of-stock-message">
                <p>Este produto está temporariamente fora de estoque.</p>
                <button className="btn-notify">
                  🔔 Notificar quando disponível
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
