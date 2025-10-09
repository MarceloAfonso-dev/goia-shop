import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import MyAccountPage from './components/MyAccountPage';
import PublicProductGrid from './components/PublicProductGrid';
import ProductDetailPage from './components/ProductDetailPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import { useAuth } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';

function App() {
  const { user, loading, login, logout } = useAuth();

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

  const handleLoginSuccess = (userData) => {
    login(userData);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Routes>
          {/* Rota principal - Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Rota de autenticação (login/cadastro) */}
          <Route path="/login" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
          
          {/* Rotas do e-commerce público */}
          <Route path="/produtos" element={<PublicProductGrid />} />
          <Route path="/produto/:id" element={<ProductDetailPage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          
          {/* Rota da área do usuário */}
          <Route 
            path="/minha-conta" 
            element={
              user && user.grupo !== 'ADMIN' ? (
                <MyAccountPage />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Rota do dashboard (protegida) */}
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Redirect para dashboard se já logado, senão para landing */}
          <Route 
            path="/admin" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          {/* Rota catch-all - redireciona para landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
