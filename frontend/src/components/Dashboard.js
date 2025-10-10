import React, { useState } from 'react';
import ProductList from './ProductList';
import UserList from './UserList';

const Dashboard = ({ user, onLogout }) => {
    const [currentView, setCurrentView] = useState('menu');

    const handleLogout = () => {
        onLogout();
    };

    const renderMenu = () => (
        <div style={{ minHeight: '100vh', backgroundColor: '#F1F2F4' }}>
            {/* GOI Header */}
            <header className="goi-header">
                <div className="goi-logo">
                    <h1>GOIA Shop - Dashboard</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <h6 style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#000' }}>
                            {user.nome}
                        </h6>
                        <small style={{ color: '#555', fontSize: '14px' }}>
                            {user.grupo}
                        </small>
                    </div>
                    <button 
                        className="btn btn-danger"
                        onClick={handleLogout}
                        style={{ padding: '8px 16px' }}
                    >
                        Sair
                    </button>
                </div>
            </header>

            <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
                <h3 style={{ 
                    fontSize: '26px', 
                    color: '#464646', 
                    marginBottom: '40px',
                    fontWeight: '500'
                }}>
                    Bem-vindo ao sistema, {user.nome}!
                </h3>

                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    flexWrap: 'wrap', 
                    gap: '16px',
                    padding: '20px 0'
                }}>
                    <div className="product-card">
                        <div className="icon" style={{ fontSize: '20px', marginBottom: '10px' }}>📦</div>
                        <h3>Produtos</h3>
                        <p>Visualize e gerencie todos os produtos do sistema</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setCurrentView('products')}
                            style={{ width: '100%' }}
                        >
                            Listar Produtos
                        </button>
                    </div>

                    {user.grupo === 'ADMIN' && (
                        <div className="product-card">
                            <div className="icon" style={{ fontSize: '20px', marginBottom: '10px' }}>👥</div>
                            <h3>Usuários</h3>
                            <p>Gerencie usuários do sistema (apenas administradores)</p>
                            <button 
                                className="btn btn-success"
                                onClick={() => setCurrentView('users')}
                                style={{ width: '100%' }}
                            >
                                Listar Usuários
                            </button>
                        </div>
                    )}

                    {user.grupo === 'ESTOQUISTA' && (
                        <div className="product-card">
                            <div className="icon" style={{ fontSize: '20px', marginBottom: '10px' }}>�</div>
                            <h3>Controle de Estoque</h3>
                            <p>Gerencie quantidades dos produtos em estoque</p>
                            <button 
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                Gerenciar Estoque
                            </button>
                        </div>
                    )}
                </div>

                <div className="product-card" style={{ marginTop: '40px', textAlign: 'left' }}>
                    <div className="icon" style={{ fontSize: '20px', marginBottom: '10px' }}>📋</div>
                    <h3>Instruções</h3>
                    <p>
                        {user.grupo === 'ADMIN' ? (
                            <>
                                <strong>1.</strong> Para listar produtos, clique em "Listar Produtos"<br/>
                                <strong>2.</strong> Para listar usuários, clique em "Listar Usuários"<br/>
                                <strong>3.</strong> Para voltar ao menu, use o botão "Voltar ao Menu"
                            </>
                        ) : (
                            <>
                                <strong>1.</strong> Para gerenciar estoque, clique em "Gerenciar Estoque"<br/>
                                <strong>2.</strong> Como estoquista, você pode apenas alterar quantidades<br/>
                                <strong>3.</strong> Para voltar ao menu, use o botão "Voltar ao Menu"
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (currentView) {
            case 'products':
                return (
                    <div style={{ minHeight: '100vh', backgroundColor: '#F1F2F4' }}>
                        <header className="goi-header">
                            <div className="goi-logo">
                                <h1>GOIA Shop - Produtos</h1>
                            </div>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setCurrentView('menu')}
                            >
                                ← Voltar ao Menu
                            </button>
                        </header>
                        <div className="container" style={{ paddingTop: '40px' }}>
                            <ProductList />
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div style={{ minHeight: '100vh', backgroundColor: '#F1F2F4' }}>
                        <header className="goi-header">
                            <div className="goi-logo">
                                <h1>GOIA Shop - Usuários</h1>
                            </div>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setCurrentView('menu')}
                            >
                                ← Voltar ao Menu
                            </button>
                        </header>
                        <div className="container" style={{ paddingTop: '40px' }}>
                            <UserList />
                        </div>
                    </div>
                );
            default:
                return renderMenu();
        }
    };

    return renderContent();
};

export default Dashboard;