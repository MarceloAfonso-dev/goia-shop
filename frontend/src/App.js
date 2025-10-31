import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import AdminLogin from './components/AdminLogin';
import Dashboard from './components/Dashboard';
import MyAccountPage from './components/MyAccountPage';
import PublicProductGrid from './components/PublicProductGrid';
import ProductDetailPage from './components/ProductDetailPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderSummaryPage from './components/OrderSummaryPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import { useAuth } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';

function App() {
  const { user, loading, login, logout, isBackofficeUser, isClienteUser, getUserType } = useAuth();

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
          
          {/* Rota de autenticação (login/cadastro) - apenas para clientes */}
          <Route path="/login" element={
            isBackofficeUser() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPage onLoginSuccess={handleLoginSuccess} />
            )
          } />
          
          {/* Rota de login administrativo - apenas para backoffice */}
          <Route path="/admin" element={
            isClienteUser() ? (
              <Navigate to="/" replace />
            ) : isBackofficeUser() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AdminLogin />
            )
          } />
          
          {/* Rotas do e-commerce público */}
          <Route path="/produtos" element={<PublicProductGrid />} />
          <Route path="/produto/:id" element={<ProductDetailPage />} />
          <Route path="/carrinho" element={
            isBackofficeUser() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <CartPage />
            )
          } />
          <Route path="/checkout" element={
            isBackofficeUser() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <CheckoutPage />
            )
          } />
          <Route path="/revisar-pedido" element={
            isBackofficeUser() ? (
              <Navigate to="/dashboard" replace />
            ) : user && isClienteUser() ? (
              <OrderSummaryPage />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/pedido-confirmado" element={
            isBackofficeUser() ? (
              <Navigate to="/dashboard" replace />
            ) : user && isClienteUser() ? (
              <OrderConfirmationPage />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* Rota da área do usuário - apenas para clientes */}
          <Route 
            path="/minha-conta" 
            element={
              isBackofficeUser() ? (
                <Navigate to="/dashboard" replace />
              ) : user && isClienteUser() ? (
                <MyAccountPage />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Rota do dashboard (protegida - apenas backoffice) */}
          <Route 
            path="/dashboard" 
            element={
              user && isBackofficeUser() ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : user && isClienteUser() ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/admin" replace />
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
