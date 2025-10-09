import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../hooks/useCart';
import './PublicProductGrid.css';

// Componentes de ícones PNG - Usando os ícones fornecidos
const AddToCartIcon = ({ size = 16 }) => (
  <img 
    src="/assets/img/add-to-cart.png" 
    alt="Adicionar ao carrinho" 
    style={{ 
      width: size, 
      height: size,
      filter: 'brightness(0) saturate(100%) invert(100%)',
      display: 'block',
      margin: 'auto'
    }} 
  />
);
const CartIcon = ({ size = 24 }) => (
  <img 
    src="/assets/img/cart.png" 
    alt="Carrinho" 
    style={{ 
      width: size, 
      height: size,
      filter: 'brightness(0) saturate(100%) invert(42%) sepia(82%) saturate(3174%) hue-rotate(336deg) brightness(101%) contrast(102%)'
    }} 
  />
);

const PublicProductGrid = ({ onBackToLanding, onLoginClick }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { cart, addToCart, cartCount } = useCart();

  // Função para converter URL absoluta do backend em URL relativa
  const getImageUrl = (urlArquivo) => {
    if (!urlArquivo) return null;
    // Converter http://localhost:8080/uploads/... para /uploads/...
    return urlArquivo.replace('http://localhost:8080', '');
  };

  // Função personalizada para adicionar ao carrinho e redirecionar
  const handleAddToCart = (product) => {
    addToCart(product, 1); // Sempre adicionar 1 unidade
    // Redirecionar para o carrinho
    window.location.href = '/carrinho';
  };

  // Função para navegar para a home
  const handleGoToHome = () => {
    navigate('/');
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/produtos?status=ATIVO&page=0&pageSize=12');
      
      if (response.data && response.data.content) {
        // Para resposta paginada
        setProducts(response.data.content);
      } else if (Array.isArray(response.data)) {
        // Para resposta não paginada, filtrar apenas produtos ativos
        const activeProducts = response.data.filter(product => product.status === 'ATIVO');
        setProducts(activeProducts);
      } else {
        setError('Erro ao carregar produtos');
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F1F2F4' }}>
        <header className="goi-header">
          <div className="goi-logo">
            <h1>GOIA Shop - Marketplace</h1>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={handleGoToHome}
          >
            ← Voltar
          </button>
        </header>
        <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
          <div style={{ padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛍️</div>
            <h3 style={{ color: '#464646', marginBottom: '10px' }}>Carregando produtos...</h3>
            <p style={{ color: '#555' }}>Aguarde enquanto buscamos os melhores produtos para você.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F1F2F4' }}>
        <header className="goi-header">
          <div className="goi-logo">
            <h1>GOIA Shop - Marketplace</h1>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={handleGoToHome}
          >
            ← Voltar
          </button>
        </header>
        <div className="container" style={{ paddingTop: '40px' }}>
          <div className="product-card" style={{ textAlign: 'center', marginTop: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h3 style={{ color: '#d90000', marginBottom: '10px' }}>Erro ao carregar produtos</h3>
            <p style={{ color: '#555', marginBottom: '20px' }}>{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={fetchProducts}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F1F2F4' }}>
      {/* GOI Header */}
      <header className="goi-header">
        <div className="goi-logo" onClick={handleGoToHome} style={{ cursor: 'pointer' }}>
          <img src="/assets/img/goia-icon-header.png" alt="GOIA" style={{ width: '52px', height: '52px' }} />
          <h1>GOIA Shop</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Carrinho */}
          <div 
            style={{ position: 'relative', cursor: 'pointer', padding: '8px' }}
            onClick={() => window.location.href = '/carrinho'}
            title="Ver carrinho"
          >
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CartIcon size={28} color="#FF4F5A" />
              {cartCount > 0 && (
                <span style={{
                  backgroundColor: '#FF4F5A',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  position: 'absolute',
                  top: '0px',
                  right: '0px'
                }}>
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '32px', 
            color: '#1c1c1c', 
            marginBottom: '12px', 
            fontWeight: '600' 
          }}>
            Marketplace GOIA
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#555', 
            maxWidth: '600px', 
            margin: '0 auto' 
          }}>
            Descubra produtos incríveis com cashback, parcelamento sem juros e ofertas exclusivas.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="product-card" style={{ textAlign: 'center', marginTop: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
            <h3 style={{ color: '#464646', marginBottom: '10px' }}>Nenhum produto encontrado</h3>
            <p style={{ color: '#555' }}>No momento não temos produtos disponíveis no marketplace.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div 
                  style={{ 
                    width: '100%', 
                    height: '180px', 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: '8px', 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: getImageUrl(product.imagemPrincipal?.urlArquivo) ? `url(${getImageUrl(product.imagemPrincipal.urlArquivo)})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: '#999'
                  }}
                >
                  {!product.imagemPrincipal?.urlArquivo && '📦'}
                </div>
                
                <h3 style={{ 
                  fontSize: '18px', 
                  color: '#1c1c1c', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  lineHeight: '1.3'
                }}>
                  {product.nome}
                </h3>
                
                <p style={{ 
                  fontSize: '14px', 
                  color: '#555', 
                  marginBottom: '12px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.descricao || 'Produto incrível com ótima qualidade e preço especial.'}
                </p>
                
                <div style={{ 
                  fontSize: '20px', 
                  color: '#FF4F5A', 
                  fontWeight: '600', 
                  marginBottom: '16px' 
                }}>
                  {formatPrice(product.preco)}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleProductClick(product)}
                    style={{ flex: 2 }}
                  >
                    Ver Detalhes
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleAddToCart(product)}
                    style={{ 
                      flex: 1,
                      fontSize: '14px',
                      padding: '8px 12px',
                      backgroundColor: '#28a745',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Adicionar ao carrinho"
                  >
                    <AddToCartIcon size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Produto */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #eee',
              backgroundColor: '#F1F2F4',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: '#1c1c1c', 
                fontSize: '24px', 
                fontWeight: '600' 
              }}>
                Detalhes do Produto
              </h3>
              <button
                onClick={closeProductDetails}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '30px' }}>
              <div style={{ 
                width: '100%', 
                height: '300px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '8px', 
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: getImageUrl(selectedProduct.imagemPrincipal?.urlArquivo) ? `url(${getImageUrl(selectedProduct.imagemPrincipal.urlArquivo)})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#999',
                fontSize: '48px'
              }}>
                {!selectedProduct.imagemPrincipal?.urlArquivo && '📦'}
              </div>
              
              <h2 style={{ 
                fontSize: '28px', 
                color: '#1c1c1c', 
                marginBottom: '16px', 
                fontWeight: '600' 
              }}>
                {selectedProduct.nome}
              </h2>
              
              <p style={{ 
                fontSize: '16px', 
                color: '#555', 
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                {selectedProduct.descricao || 'Este é um produto incrível com ótima qualidade e preço especial. Perfeito para suas necessidades!'}
              </p>
              
              <div style={{ 
                fontSize: '32px', 
                color: '#FF4F5A', 
                fontWeight: '700', 
                marginBottom: '24px' 
              }}>
                {formatPrice(selectedProduct.preco)}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                flexWrap: 'wrap' 
              }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleAddToCart(selectedProduct)}
                  style={{ 
                    fontSize: '16px', 
                    padding: '16px 32px',
                    backgroundColor: '#28a745',
                    border: 'none',
                    minWidth: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <AddToCartIcon size={18} />
                  Adicionar ao Carrinho
                </button>
                <button 
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: '200px' }}
                  onClick={() => alert('Funcionalidade de compra será implementada em breve!')}
                >
                  Comprar Agora
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={closeProductDetails}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProductGrid;
