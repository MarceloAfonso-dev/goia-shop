import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import EcommerceHeader from './EcommerceHeader';
import './PublicProductGrid.css';

const PublicProductGrid = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Função para converter URL absoluta do backend em URL relativa
  const getImageUrl = (urlArquivo) => {
    if (!urlArquivo) return null;
    return urlArquivo.replace('http://localhost:8080', '');
  };

  // Função para obter imagem principal do produto
  const getMainImage = (produto) => {
    if (produto.imagens && produto.imagens.length > 0) {
      // Buscar imagem marcada como principal
      const imagemPrincipal = produto.imagens.find(img => img.isPrincipal || img.is_principal);
      if (imagemPrincipal) {
        return getImageUrl(imagemPrincipal.urlArquivo || imagemPrincipal.url_arquivo);
      }
      // Se não encontrar principal, usar a primeira
      return getImageUrl(produto.imagens[0].urlArquivo || produto.imagens[0].url_arquivo);
    }
    return null;
  };

  // Função para formatar preço
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Função para navegar para detalhes do produto
  const handleViewDetails = (productId) => {
    navigate(`/produto/${productId}`);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/produtos?status=ATIVO&page=0&pageSize=24');
      
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

  if (loading) {
    return (
      <div className="ecommerce-page">
        <EcommerceHeader />
        <div className="loading-container">
          <div className="loading-spinner">🛍️</div>
          <h3>Carregando produtos...</h3>
          <p>Aguarde enquanto buscamos os melhores produtos para você.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ecommerce-page">
        <EcommerceHeader />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Erro ao carregar produtos</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchProducts}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ecommerce-page">
      <EcommerceHeader />
      
      <main className="products-main">
        <div className="products-container">
          {/* Título da seção */}
          <div className="page-header">
            <h1>Nossos Produtos</h1>
            <p>Encontre os melhores produtos com os melhores preços!</p>
          </div>

          {/* Grid de Produtos */}
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>Nenhum produto encontrado</h3>
              <p>No momento não temos produtos disponíveis.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => {
                const mainImageUrl = getMainImage(product);
                
                return (
                  <div key={product.id} className="product-card">
                    {/* Imagem do produto */}
                    <div className="product-image-container">
                      {mainImageUrl ? (
                        <img 
                          src={mainImageUrl} 
                          alt={product.nome}
                          className="product-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300/f8f9fa/6c757d?text=Sem+Imagem';
                          }}
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          <span>📷</span>
                          <p>Sem imagem</p>
                        </div>
                      )}
                      
                      {/* Badge de destaque */}
                      {product.avaliacao >= 4 && (
                        <span className="product-badge">⭐ Destaque</span>
                      )}
                    </div>

                    {/* Informações do produto */}
                    <div className="product-info">
                      <h3 className="product-name">{product.nome}</h3>
                      
                      {/* Avaliação */}
                      {product.avaliacao && (
                        <div className="product-rating">
                          {'⭐'.repeat(Math.floor(product.avaliacao))}
                          <span className="rating-text">({product.avaliacao})</span>
                        </div>
                      )}

                      {/* Preço */}
                      <div className="product-price">
                        {formatPrice(product.preco)}
                      </div>

                      {/* Botão Ver Detalhes */}
                      <button 
                        className="btn-details"
                        onClick={() => handleViewDetails(product.id)}
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicProductGrid;
