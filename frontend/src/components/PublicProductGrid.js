import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useCart } from '../hooks/useCart';
import EcommerceHeader from './EcommerceHeader';
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


// Componente de carrossel de imagens
const ImageCarousel = ({ product, getImageUrl }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Combinar todas as imagens (principal + outras)
  const allImages = [];
  
  // Usar todas as imagens do array imagens (incluindo a principal)
  if (product.imagens && product.imagens.length > 0) {
    // Ordenar para colocar a imagem principal primeiro
    const sortedImages = [...product.imagens].sort((a, b) => {
      if (a.isPrincipal && !b.isPrincipal) return -1;
      if (!a.isPrincipal && b.isPrincipal) return 1;
      return a.ordem - b.ordem;
    });
    
    sortedImages.forEach(img => {
      allImages.push({
        url: getImageUrl(img.urlArquivo || img.caminhoArquivo),
        isPrincipal: img.isPrincipal,
        nome: img.nomeArquivo,
        id: img.id
      });
    });
  } else if (product.imagemPrincipal?.urlArquivo) {
    // Fallback: usar apenas a imagem principal se não há array de imagens
    allImages.push({
      url: getImageUrl(product.imagemPrincipal.urlArquivo),
      isPrincipal: true,
      nome: product.imagemPrincipal.nomeArquivo,
      id: product.imagemPrincipal.id
    });
  }
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };
  
  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };
  
  // Debug log
  console.log('ImageCarousel - Product:', product.nome);
  console.log('ImageCarousel - AllImages:', allImages);
  console.log('ImageCarousel - CurrentIndex:', currentImageIndex);
  
  if (allImages.length === 0) {
    return (
      <div style={{ 
        width: '100%', 
        height: '300px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '8px', 
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: '48px'
      }}>
        📦
      </div>
    );
  }
  
  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Imagem principal */}
      <div style={{ 
        position: 'relative',
        width: '100%', 
        height: '300px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '8px', 
        marginBottom: '16px',
        backgroundImage: `url(${allImages[currentImageIndex].url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Botões de navegação (apenas se houver mais de uma imagem) */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                e.target.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                e.target.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                e.target.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                e.target.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ›
            </button>
          </>
        )}
        
        {/* Contador de imagens */}
        {allImages.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {currentImageIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
      
      {/* Miniaturas (apenas se houver mais de uma imagem) */}
      {allImages.length > 1 && (
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          overflowX: 'auto',
          paddingBottom: '8px',
          paddingTop: '8px',
          justifyContent: allImages.length <= 5 ? 'center' : 'flex-start'
        }}>
          {allImages.map((image, index) => (
            <div
              key={`thumb-${image.id}-${index}`}
              onClick={() => goToImage(index)}
              style={{
                width: '70px',
                height: '70px',
                minWidth: '70px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                backgroundImage: `url(${image.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer',
                border: currentImageIndex === index ? '3px solid #FF4F5A' : '3px solid #e0e0e0',
                opacity: currentImageIndex === index ? 1 : 0.6,
                transition: 'all 0.3s ease',
                boxShadow: currentImageIndex === index ? '0 4px 12px rgba(255, 79, 90, 0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
                transform: currentImageIndex === index ? 'scale(1.05)' : 'scale(1)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (currentImageIndex !== index) {
                  e.target.style.opacity = '0.8';
                  e.target.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentImageIndex !== index) {
                  e.target.style.opacity = '0.6';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {/* Indicador de imagem principal */}
              {image.isPrincipal && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: '#FF4F5A',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  ★
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PublicProductGrid = ({ onBackToLanding, onLoginClick }) => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const { addToCart } = useCart();

  // Função para converter URL absoluta do backend em URL relativa
  const getImageUrl = (urlArquivo) => {
    if (!urlArquivo) return null;
    // Converter http://localhost:8080/uploads/... para /uploads/...
    return urlArquivo.replace('http://localhost:8080', '');
  };

  // Função personalizada para adicionar ao carrinho (sem redirecionar)
  const handleAddToCart = (product) => {
    // Simplesmente adiciona ao carrinho
    // O toast será exibido automaticamente pelo useCart
    addToCart(product, 1);
  };



  useEffect(() => {
    fetchCategorias();
    fetchProducts();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await api.get('/categorias/public');
      setCategorias(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const fetchProducts = async (termo = '', categoria = '') => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      if (termo.trim() || categoria) {
        // Buscar produtos com filtros
        const params = new URLSearchParams();
        if (termo.trim()) params.append('termo', termo);
        if (categoria) params.append('categoriaId', categoria);
        
        response = await api.get(`/produtos/public/buscar?${params.toString()}`);
        setProducts(Array.isArray(response.data) ? response.data : []);
      } else {
        // Carregar todos os produtos ativos
        response = await api.get('/produtos?status=ATIVO&page=0&pageSize=12');
        
        if (response.data && response.data.content) {
          setProducts(response.data.content);
        } else if (Array.isArray(response.data)) {
          const activeProducts = response.data.filter(product => product.status === 'ATIVO');
          setProducts(activeProducts);
        } else {
          setError('Erro ao carregar produtos');
        }
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === '' && !selectedCategoria) {
      fetchProducts();
      return;
    }
    setSearching(true);
    await fetchProducts(searchTerm, selectedCategoria);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedCategoria('');
    fetchProducts();
  };

  const handleCategoryChange = async (categoriaId) => {
    setSelectedCategoria(categoriaId);
    setSearching(true);
    await fetchProducts(searchTerm, categoriaId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="landing-page" style={{ minHeight: '100vh', backgroundColor: '#F1F2F4' }}>
        <EcommerceHeader />
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
      <div className="landing-page" style={{ minHeight: '100vh', backgroundColor: '#F1F2F4' }}>
        <EcommerceHeader />
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
    <div className="landing-page" style={{ minHeight: '100vh', backgroundColor: '#F1F2F4' }}>
      {/* Header Padronizado */}
      <EcommerceHeader />

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
            margin: '0 auto 24px auto' 
          }}>
            Descubra produtos incríveis com cashback, parcelamento sem juros e ofertas exclusivas.
          </p>
          
          {/* Seletor de Categoria */}
          {categorias.length > 0 && (
            <div style={{
              maxWidth: '600px',
              margin: '0 auto 16px auto',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => handleCategoryChange('')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: !selectedCategoria ? '#FF4F5A' : '#f8f9fa',
                  color: !selectedCategoria ? 'white' : '#666',
                  border: !selectedCategoria ? 'none' : '1px solid #ddd',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Todas
              </button>
              {categorias.map((categoria) => (
                <button
                  key={categoria.id}
                  onClick={() => handleCategoryChange(categoria.id.toString())}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: selectedCategoria === categoria.id.toString() ? '#FF4F5A' : '#f8f9fa',
                    color: selectedCategoria === categoria.id.toString() ? 'white' : '#666',
                    border: selectedCategoria === categoria.id.toString() ? 'none' : '1px solid #ddd',
                    borderRadius: '20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategoria !== categoria.id.toString()) {
                      e.target.style.backgroundColor = '#e9ecef';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategoria !== categoria.id.toString()) {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                >
                  {categoria.nome}
                </button>
              ))}
            </div>
          )}
          
          {/* Campo de Busca */}
          <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF4F5A'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              style={{
                padding: '12px 20px',
                backgroundColor: '#FF4F5A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: searching ? 'not-allowed' : 'pointer',
                opacity: searching ? 0.7 : 1,
                transition: 'all 0.3s ease',
                minWidth: '80px'
              }}
            >
              {searching ? '...' : '🔍'}
            </button>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Limpar
              </button>
            )}
          </div>
          
          {searchTerm && (
            <p style={{
              fontSize: '14px',
              color: '#666',
              marginTop: '12px'
            }}>
              {searching ? 'Buscando...' : `Resultados para: "${searchTerm}"`}
            </p>
          )}
        </div>

        {products.length === 0 ? (
          <div className="product-card" style={{ textAlign: 'center', marginTop: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
            <h3 style={{ color: '#464646', marginBottom: '10px' }}>
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
            </h3>
            <p style={{ color: '#555' }}>
              {searchTerm ? `Não encontramos produtos para "${searchTerm}". Tente outro termo.` : 'No momento não temos produtos disponíveis no marketplace.'}
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                style={{
                  marginTop: '16px',
                  padding: '10px 20px',
                  backgroundColor: '#FF4F5A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Ver todos os produtos
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Indicador de quantidade de produtos */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              color: '#666',
              fontSize: '14px'
            }}>
              {searchTerm ? 
                `${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}` :
                `${products.length} produto${products.length !== 1 ? 's' : ''} disponível${products.length !== 1 ? 'eis' : ''}`
              }
            </div>
            
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
          </>
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
              <ImageCarousel product={selectedProduct} getImageUrl={getImageUrl} />
              
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
                    flex: 1,
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
                  className="btn btn-secondary"
                  onClick={closeProductDetails}
                  style={{ minWidth: '120px' }}
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
