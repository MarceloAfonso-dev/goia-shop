import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ title: '', description: '' });
  const [openFaq, setOpenFaq] = useState(null);

  const handlePopupOpen = (title, description) => {
    setPopupData({ title, description });
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const benefits = [
    {
      icon: '📱',
      title: 'Tudo em parcelas sem juros',
      description: 'Parcelas que cabem no seu bolso.'
    },
    {
      icon: '🎁',
      title: 'Ofertas do dia',
      description: 'De segunda a sexta, sempre uma oferta exclusiva.'
    },
    {
      icon: '💰',
      title: 'Aqui tem cashback',
      description: 'Compre e ganhe cashback.'
    },
    {
      icon: '🎯',
      title: 'Fecho com você',
      description: 'Recomendações que combinam com você.'
    },
    {
      icon: '✅',
      title: 'Experiência simples',
      description: 'Faça compras sem precisar cadastrar cartão.'
    },
    {
      icon: '🔒',
      title: 'Segurança na compra',
      description: 'Conte com toda a segurança GOIA.'
    }
  ];

  const categories = [
    {
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
      title: 'Pra te manter conectado',
      description: 'Aqui você acha os eletrônicos das principais marcas que já conhece e confia.',
      linkTitle: 'Smartphones',
      linkDescription: 'Grandes marcas com preços especiais no GOIA Shop.'
    },
    {
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
      title: 'Pra facilitar seu dia a dia',
      description: 'Faça mercado direto no app e receba os produtos com toda a comodidade.',
      linkTitle: 'Mercado',
      linkDescription: 'Mercado online com frete grátis e descontos exclusivos.'
    },
    {
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      title: 'Pra manter sua casa equipada',
      description: 'Grande variedade de marcas com os eletrodomésticos que o seu lar precisa.',
      linkTitle: 'Eletrodomésticos',
      linkDescription: 'Desde geladeiras até cafeteiras, tudo com parcelamento fácil.'
    },
    {
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
      title: 'Pra te manter em movimento',
      description: 'Tenis, calçados e tudo o mais para a prática de esportes.',
      linkTitle: 'Calçados',
      linkDescription: 'Tênis esportivos com até 50% off no GOIA Shop.'
    }
  ];

  const faqs = [
    {
      question: 'Como faço para ter o cartão de crédito no GOIA?',
      answer: 'Para ter o cartão de crédito GOIA, basta abrir uma conta e solicitar pelo aplicativo.'
    },
    {
      question: 'É necessário ter uma renda mínima para abrir uma conta GOIA?',
      answer: 'Não, não é necessário ter uma renda mínima para abrir uma conta no GOIA.'
    },
    {
      question: 'O GOIA é do Senac?',
      answer: 'Não, o GOIA é uma instituição financeira independente, mas com valores alinhados ao Senac.'
    },
    {
      question: 'O GOIA tem agência?',
      answer: 'O GOIA é 100% digital e não possui agências físicas. Todo atendimento é feito online.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src="/assets/img/goia-icon-header.png" alt="GOIA" />
          GOIA Shop
        </div>
        <nav className="navi">
          <a href="#benefits">Para você</a>
          <a href="#categories">Vantagens</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/produtos'); }}>Produtos</a>
          <a href="#faq">Ajuda</a>
        </nav>
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
          
          <button className="btn-cta" onClick={() => window.open('https://goia.click/cadastro', '_blank')}>
            Abrir conta
          </button>
          
          {/* Link Admin - Apenas se não for cliente */}
          {!user || (user && user.grupo !== 'CLIENTE' && user.tipo !== 'CLIENTE') ? (
            <small style={{marginLeft: '10px'}}>
              <a href="/admin" style={{color: '#666', fontSize: '12px', textDecoration: 'none'}}>
                Admin
              </a>
            </small>
          ) : null}
        </div>
      </header>

      {/* Hero Banner */}
      <section 
        className="hero"
        style={{
          backgroundImage: `url('/assets/img/pessoas-conversando.png')`
        }}
      >
        <div className="hero-content">
          <h1>GOIA Shop</h1>
          <p>Um shopping completo online, com cashback, ofertas exclusivas e produtos incríveis para toda família.</p>
          <button className="btn-hero" onClick={() => navigate('/produtos')}>
            Ver Produtos
          </button>
        </div>
      </section>

      {/* Benefícios */}
      <section className="benefits" id="benefits">
        <h2>O GOIA Shop te dá as melhores condições</h2>
        <p>Descubra as vantagens de comprar em uma loja completa no seu app.</p>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-item">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categorias */}
      <section className="categories" id="categories">
        <h2>Encontre de tudo no GOIA Shop</h2>
        <div className="carousel">
          {categories.map((category, index) => (
            <div key={index} className="category-card">
              <img src={category.image} alt={category.title} />
              <div className="text">
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <a 
                  href="#" 
                  className="popup-trigger"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePopupOpen(category.linkTitle, category.linkDescription);
                  }}
                >
                  Ver ofertas →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="faq-container">
          <h2>Ficou alguma dúvida?</h2>
          <p>Se a sua dúvida não estiver nas perguntas frequentes, fala com a gente!</p>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="faq-item"
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                <span className="plus">{openFaq === index ? '-' : '+'}</span>
                <div className={`faq-answer ${openFaq === index ? '' : 'hidden'}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="contact-link">
            <a href="mailto:contato@GOIAbank.com.br">ENTRE EM CONTATO →</a>
          </div>
        </div>
      </section>

      {/* Popup */}
      {showPopup && (
        <div className="popup" onClick={handlePopupClose}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={handlePopupClose}>×</button>
            <h3>{popupData.title}</h3>
            <p>{popupData.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
