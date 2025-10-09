import React from 'react';
import { useNavigate } from 'react-router-dom';
import EcommerceHeader from './EcommerceHeader';
import { useCart } from '../hooks/useCart';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    cartCount, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal 
  } = useCart();

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
              
              <div className="summary-line">
                <span>Frete</span>
                <span>Grátis</span>
              </div>
              
              <div className="summary-total">
                <span>Total</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>

              <button className="btn-checkout">
                Finalizar Compra
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
