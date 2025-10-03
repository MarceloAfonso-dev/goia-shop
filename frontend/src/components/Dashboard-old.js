import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import ProductList from './ProductList';
import UserList from './UserList';

const Dashboard = ({ user, onLogout }) => {
    const [currentView, setCurrentView] = useState('menu');
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        onLogout();
    };

    const renderMenu = () => (
        <div>
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

            <div className="container" style={{ marginTop: '40px' }}>
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
                                <Card.Title>👥 Usuários</Card.Title>
                                <Card.Text>
                                    Gerencie usuários do sistema (apenas administradores)
                                </Card.Text>
                                <Button 
                                    variant="success" 
                                    onClick={() => setCurrentView('users')}
                                    className="w-100"
                                >
                                    Listar Usuários
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                )}

                {user.grupo === 'ESTOQUISTA' && (
                    <Col md={6} className="mb-3">
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
                                <Card.Title>📊 Estatísticas</Card.Title>
                                <Card.Text>
                                    Visualize estatísticas de produtos e estoque
                                </Card.Text>
                                <Button 
                                    variant="info" 
                                    disabled
                                    className="w-100"
                                >
                                    Em Desenvolvimento
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>📋 Instruções</Card.Title>
                            <Card.Text>
                                <strong>1.</strong> Para listar produtos, clique em "Listar Produtos"<br/>
                                {user.grupo === 'ADMIN' && (
                                    <>
                                        <strong>2.</strong> Para listar usuários, clique em "Listar Usuários"<br/>
                                    </>
                                )}
                                <strong>{user.grupo === 'ADMIN' ? '3.' : '2.'}</strong> Para voltar ao menu, use o botão "Voltar ao Menu"
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );

    const renderContent = () => {
        switch (currentView) {
            case 'products':
                return (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>Lista de Produtos</h3>
                            <Button variant="outline-secondary" onClick={() => setCurrentView('menu')}>
                                ← Voltar ao Menu
                            </Button>
                        </div>
                        <ProductList />
                    </div>
                );
            case 'users':
                return (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>Lista de Usuários</h3>
                            <Button variant="outline-secondary" onClick={() => setCurrentView('menu')}>
                                ← Voltar ao Menu
                            </Button>
                        </div>
                        <UserList />
                    </div>
                );
            default:
                return renderMenu();
        }
    };

    return (
        <Container fluid>
            {renderContent()}
        </Container>
    );
};

export default Dashboard;
