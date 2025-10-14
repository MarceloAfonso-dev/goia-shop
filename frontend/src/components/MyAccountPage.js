import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import EcommerceHeader from './EcommerceHeader';
import './MyAccountPage.css';

const MyAccountPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        // Verificar se usuário está logado
        if (!user) {
            navigate('/login');
            return;
        }

        // Se for admin, redirecionar para dashboard
        if (user.grupo === 'ADMIN') {
            navigate('/dashboard');
            return;
        }

        // Carregar dados do perfil
        loadUserProfile();
    }, [user, navigate]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            // Implementar busca de dados do usuário
            setUserProfile(user);
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user || user.grupo === 'ADMIN') {
        return null;
    }

    return (
        <div className="ecommerce-page">
            <EcommerceHeader />
            
            <div className="account-container">
                <div className="account-header">
                    <h1>Minha Conta</h1>
                    <p>Olá, <strong>{user.nome}</strong>! Gerencie suas informações e pedidos.</p>
                </div>

                <div className="account-content">
                    {/* Sidebar */}
                    <div className="account-sidebar">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user.nome?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                                <h3>{user.nome}</h3>
                                <p>{user.email}</p>
                            </div>
                        </div>

                        <nav className="account-nav">
                            <button 
                                className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveSection('profile')}
                            >
                                👤 Meu Perfil
                            </button>
                            <button 
                                className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveSection('orders')}
                            >
                                📦 Meus Pedidos
                            </button>
                            <button 
                                className={`nav-item ${activeSection === 'addresses' ? 'active' : ''}`}
                                onClick={() => setActiveSection('addresses')}
                            >
                                📍 Endereços
                            </button>
                            <button 
                                className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveSection('security')}
                            >
                                🔒 Segurança
                            </button>
                            <button 
                                className="nav-item logout"
                                onClick={handleLogout}
                            >
                                🚪 Sair
                            </button>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="account-main">
                        {activeSection === 'profile' && (
                            <div className="section-content">
                                <div className="section-header">
                                    <h2>Meu Perfil</h2>
                                    <p>Gerencie suas informações pessoais</p>
                                </div>

                                <div className="profile-card">
                                    <div className="info-group">
                                        <label>Nome Completo</label>
                                        <div className="info-value">{user.nome}</div>
                                    </div>

                                    <div className="info-group">
                                        <label>Email</label>
                                        <div className="info-value">{user.email}</div>
                                    </div>

                                    <div className="info-group">
                                        <label>Telefone</label>
                                        <div className="info-value">{user.telefone || 'Não informado'}</div>
                                    </div>

                                    <div className="info-group">
                                        <label>Membro desde</label>
                                        <div className="info-value">
                                            {user.dataCriacao ? new Date(user.dataCriacao).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>

                                    <button className="btn-edit-profile">
                                        ✏️ Editar Perfil
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'orders' && (
                            <div className="section-content">
                                <div className="section-header">
                                    <h2>Meus Pedidos</h2>
                                    <p>Acompanhe o status dos seus pedidos</p>
                                </div>

                                <div className="orders-list">
                                    <div className="empty-orders">
                                        <div className="empty-icon">📦</div>
                                        <h3>Você ainda não fez nenhum pedido</h3>
                                        <p>Que tal explorar nossos produtos?</p>
                                        <button 
                                            className="btn-shop-now"
                                            onClick={() => navigate('/produtos')}
                                        >
                                            Comprar Agora
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'addresses' && (
                            <div className="section-content">
                                <div className="section-header">
                                    <h2>Meus Endereços</h2>
                                    <p>Gerencie seus endereços de entrega</p>
                                </div>

                                <div className="addresses-list">
                                    <div className="empty-addresses">
                                        <div className="empty-icon">📍</div>
                                        <h3>Nenhum endereço cadastrado</h3>
                                        <p>Adicione um endereço para facilitar suas compras</p>
                                        <button className="btn-add-address">
                                            ➕ Adicionar Endereço
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="section-content">
                                <div className="section-header">
                                    <h2>Segurança</h2>
                                    <p>Gerencie sua senha e configurações de segurança</p>
                                </div>

                                <div className="security-card">
                                    <div className="security-item">
                                        <div className="security-info">
                                            <h4>Alterar Senha</h4>
                                            <p>Recomendamos alterar sua senha periodicamente</p>
                                        </div>
                                        <button className="btn-change-password">
                                            🔑 Alterar Senha
                                        </button>
                                    </div>

                                    <div className="security-item">
                                        <div className="security-info">
                                            <h4>Histórico de Login</h4>
                                            <p>Último acesso: Hoje</p>
                                        </div>
                                        <button className="btn-view-history">
                                            📋 Ver Histórico
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAccountPage;
