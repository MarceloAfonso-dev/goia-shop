import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PublicProductGrid from './components/PublicProductGrid';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'login', 'dashboard', 'marketplace'

  // Quando o usuário for carregado do localStorage, ir direto para o dashboard
  useEffect(() => {
    if (user) {
      console.log('App - usuário logado detectado, indo para dashboard');
      setCurrentPage('dashboard');
    } else {
      console.log('App - usuário não logado, ficando na landing');
      setCurrentPage('landing');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando GOIA Shop...</p>
        </div>
      </div>
    );
  }

  const handleLoginClick = () => {
    setCurrentPage('login');
  };

  const handleLoginSuccess = (userData) => {
    login(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('landing');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  const handleGoToMarketplace = () => {
    setCurrentPage('marketplace');
  };

  return (
    <div className="App">
      {currentPage === 'landing' && (
        <LandingPage 
          onLoginClick={handleLoginClick} 
          onGoToMarketplace={handleGoToMarketplace}
        />
      )}
      {currentPage === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onBackToLanding={handleBackToLanding}
        />
      )}
      {currentPage === 'marketplace' && (
        <PublicProductGrid 
          onBackToLanding={handleBackToLanding}
          onLoginClick={handleLoginClick}
        />
      )}
      {currentPage === 'dashboard' && user && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
