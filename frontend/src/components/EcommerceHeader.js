import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import '../components/LandingPage.css'; // Usar o mesmo CSS da LandingPage

const EcommerceHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { user } = useAuth();
  
  // Debug removido

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <img src="/assets/img/goia-icon-header.png" alt="GOIA" />
        GOIA Shop
      </div>

      {/* Navegação */}
      <nav className="navi">
        <a 
          href="#" 
          onClick={(e) => { 
            e.preventDefault(); 
            navigate('/'); 
          }}
          style={{ 
            fontWeight: location.pathname === '/' ? 'bold' : 'normal',
            textDecoration: location.pathname === '/' ? 'underline' : 'none'
          }}
        >
          Home
        </a>
        <a 
          href="#" 
          onClick={(e) => { 
            e.preventDefault(); 
            navigate('/produtos'); 
          }}
          style={{ 
            fontWeight: location.pathname === '/produtos' ? 'bold' : 'normal',
            textDecoration: location.pathname === '/produtos' ? 'underline' : 'none'
          }}
        >
          Produtos
        </a>
      </nav>

      {/* Área direita */}
      <div className="header-right">
        {/* Login/Account Link */}
        {user ? (
          <button 
            className="btn-login"
            onClick={() => {
              if (user.grupo === 'ADMIN' || user.grupo === 'ESTOQUISTA') {
                navigate('/dashboard');
              } else {
                navigate('/minha-conta');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#FF4F5A',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {user.nome?.charAt(0).toUpperCase()}
            </div>
            <span>Olá, {user.nome?.split(' ')[0]}</span>
          </button>
        ) : (
          <button className="btn-login" onClick={() => navigate('/login')}>
            Login
          </button>
        )}

        {/* Botão Carrinho */}
        <button 
          className="btn-cta"
          onClick={() => navigate('/carrinho')}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🛒 Carrinho
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#d90000',
              color: 'white',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              border: '2px solid white'
            }}>
              {cartCount}
            </span>
          )}
        </button>

        {/* Link Admin (pequeno) - Apenas se não for cliente */}
        {!user || (user && user.tipo !== 'CLIENTE') ? (
          <small style={{marginLeft: '10px'}}>
            <a href="/admin" style={{color: '#666', fontSize: '12px', textDecoration: 'none'}}>
              Admin
            </a>
          </small>
        ) : null}
      </div>
    </header>
  );
};

export default EcommerceHeader;
