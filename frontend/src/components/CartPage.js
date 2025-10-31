import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EcommerceHeader from './EcommerceHeader';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    cart, 
    cartCount, 
    cartToken,
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal,
    preserveCartWithToken
  } = useCart();

  // Estados para simulação de frete
  const [cepFrete, setCepFrete] = useState('');
  const [freteOpcoes, setFreteOpcoes] = useState([]);
  const [freteSelecionado, setFreteSelecionado] = useState(null);
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [freteError, setFreteError] = useState('');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price || 0);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `http://localhost:8080/api/produtos/imagem/${imagePath}`;
  };

  // Função para simular frete
  const simularFrete = async () => {
    if (!cepFrete || cepFrete.length < 8) {
      setFreteError('Por favor, insira um CEP válido');
      return;
    }

    setLoadingFrete(true);
    setFreteError('');
    setFreteOpcoes([]);
    setFreteSelecionado(null);

    try {
      const response = await api.post('/frete/simular', {
        cep: cepFrete,
        valorTotal: getCartTotal()
      });

      if (response.data.success) {
        setFreteOpcoes(response.data.opcoes);
        setFreteError('');
      } else {
        setFreteError(response.data.message || 'Erro ao calcular frete');
      }
    } catch (error) {
      console.error('Erro ao simular frete:', error);
      setFreteError('Erro ao calcular frete. Verifique o CEP e tente novamente.');
    } finally {
      setLoadingFrete(false);
    }
  };

  // Função para formatar CEP
  const formatCep = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Função para lidar com mudança do CEP
  const handleCepChange = (e) => {
    const formatted = formatCep(e.target.value);
    setCepFrete(formatted);
    
    // Limpar opções de frete quando CEP mudar
    if (freteOpcoes.length > 0) {
      setFreteOpcoes([]);
      setFreteSelecionado(null);
    }
  };

  // Calcular total com frete
  const getTotalComFrete = () => {
    const subtotal = getCartTotal();
    const valorFrete = freteSelecionado ? freteSelecionado.preco : 0;
    return subtotal + valorFrete;
  };

  // Função para iniciar checkout
  const handleCheckout = () => {
    if (!user) {
      // Se não estiver logado, preservar carrinho e ir para login
      preserveCartWithToken();
      navigate(`/login?cart_token=${cartToken}&redirect=checkout`);
    } else {
      // Se já estiver logado, ir direto para checkout
      navigate('/checkout');
    }
  };

  if (cartCount === 0) {
    return (
      <div className="ecommerce-page">
        <EcommerceHeader />
        <div className="cart-container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione alguns produtos incríveis ao seu carrinho!</p>
            <button className="btn-continue-shopping" onClick={() => navigate('/produtos')}>
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ecommerce-page">
      <EcommerceHeader />
      
      <div className="cart-container">
        <div className="cart-header">
          <h1>Meu Carrinho</h1>
          <p>{cartCount} item{cartCount > 1 ? 's' : ''} no seu carrinho</p>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.imagem ? (
                    <img 
                      src={getImageUrl(item.imagem)} 
                      alt={item.nome}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <span>📦</span>
                    </div>
                  )}
                  <div className="image-placeholder" style={{ display: 'none' }}>
                    <span>📦</span>
                  </div>
                </div>

                <div className="item-details">
                  <h3 className="item-name">{item.nome}</h3>
                  <p className="item-price">{formatPrice(item.preco)}</p>
                  {/* Mostrar estoque disponível */}
                  {item.produtoCompleto && (
                    <p style={{ 
                      fontSize: '0.85rem', 
                      color: item.produtoCompleto.quantidade <= 5 ? '#d90000' : '#64748b',
                      margin: '4px 0 0 0'
                    }}>
                      {item.produtoCompleto.quantidade <= 5 ? '⚠️ ' : ''}
                      Estoque: {item.produtoCompleto.quantidade} unidade(s)
                    </p>
                  )}
                </div>

                <div className="item-quantity">
                  <button 
                    className="qty-btn" 
                    onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantidade}</span>
                  <button 
                    className="qty-btn" 
                    onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                    disabled={item.produtoCompleto && item.quantidade >= item.produtoCompleto.quantidade}
                    style={{
                      opacity: item.produtoCompleto && item.quantidade >= item.produtoCompleto.quantidade ? 0.5 : 1,
                      cursor: item.produtoCompleto && item.quantidade >= item.produtoCompleto.quantidade ? 'not-allowed' : 'pointer'
                    }}
                    title={item.produtoCompleto && item.quantidade >= item.produtoCompleto.quantidade ? 'Estoque máximo atingido' : 'Aumentar quantidade'}
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  {formatPrice(item.preco * item.quantidade)}
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                  title="Remover item"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Resumo do Pedido</h3>
              
              <div className="summary-line">
                <span>Subtotal ({cartCount} item{cartCount > 1 ? 's' : ''})</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>

              {/* Seção de Simulação de Frete */}
              <div className="frete-section" style={{ margin: '20px 0', padding: '15px', border: '1px solid #e1e5e9', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                <h4 style={{ marginBottom: '10px', fontSize: '1rem', color: '#333' }}>Simular Frete</h4>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={cepFrete}
                    onChange={handleCepChange}
                    maxLength={9}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={simularFrete}
                    disabled={loadingFrete || cepFrete.length < 9}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loadingFrete ? 'wait' : 'pointer',
                      fontSize: '14px',
                      opacity: loadingFrete || cepFrete.length < 9 ? 0.6 : 1
                    }}
                  >
                    {loadingFrete ? 'Calculando...' : 'Simular'}
                  </button>
                </div>

                {freteError && (
                  <div style={{ color: '#dc3545', fontSize: '14px', marginBottom: '10px' }}>
                    {freteError}
                  </div>
                )}

                {freteOpcoes.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <h5 style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#555' }}>Opções de Entrega:</h5>
                    {freteOpcoes.map((opcao, index) => (
                      <div
                        key={index}
                        onClick={() => setFreteSelecionado(opcao)}
                        style={{
                          padding: '10px',
                          border: `2px solid ${freteSelecionado?.tipo === opcao.tipo ? '#007bff' : '#e1e5e9'}`,
                          borderRadius: '6px',
                          marginBottom: '8px',
                          cursor: 'pointer',
                          backgroundColor: freteSelecionado?.tipo === opcao.tipo ? '#f0f8ff' : 'white',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{opcao.nome}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{opcao.prazo}</div>
                        </div>
                        <div style={{ fontWeight: 'bold', color: '#007bff' }}>
                          {formatPrice(opcao.preco)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="summary-line">
                <span>Frete</span>
                <span>{freteSelecionado ? formatPrice(freteSelecionado.preco) : 'Simule o frete'}</span>
              </div>
              
              <div className="summary-total">
                <span>Total</span>
                <span>{formatPrice(getTotalComFrete())}</span>
              </div>

              <button className="btn-checkout" onClick={handleCheckout}>
                {user ? 'Finalizar Compra' : 'Login e Finalizar'}
              </button>
              
              <button className="btn-continue" onClick={() => navigate('/produtos')}>
                Continuar Comprando
              </button>
              
              <button className="btn-clear" onClick={clearCart}>
                Limpar Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
