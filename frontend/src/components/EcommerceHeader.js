import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import './EcommerceHeader.css';

const EcommerceHeader = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user } = useAuth();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="ecommerce-header">
      <div className="header-container">
        {/* Logo da loja GOIA Shop */}
        <div className="header-logo" onClick={handleLogoClick}>
          <img 
            src="/assets/img/goia-icon-header.png" 
            alt="GOIA Shop" 
            className="logo-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <h1 className="logo-text" style={{display: 'none'}}>GOIA Shop</h1>
        </div>

        {/* Área direita com login e carrinho */}
        <div className="header-actions">
          {/* Login/Account Link */}
          {user ? (
            <button 
              className="user-account-link" 
              onClick={() => {
                if (user.grupo === 'ADMIN') {
                  navigate('/dashboard');
                } else {
                  navigate('/minha-conta');
                }
              }}
            >
              <div className="user-avatar">
                {user.nome?.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">Olá, {user.nome?.split(' ')[0]}</span>
            </button>
          ) : (
            <button className="login-link" onClick={() => navigate('/login')}>
              <span className="login-icon">👤</span>
              <span className="login-text">Faça login / Crie seu login</span>
            </button>
          )}

          {/* Ícone do carrinho */}
          <button className="cart-button" onClick={() => navigate('/carrinho')}>
            <span className="cart-icon">🛒</span>
            <span className="cart-text">Carrinho</span>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};

export default EcommerceHeader;
