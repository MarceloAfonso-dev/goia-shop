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
        <Container className="mt-4">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>Bem-vindo, {user.nome}!</h2>
                        <Button variant="outline-danger" onClick={handleLogout}>
                            Sair
                        </Button>
                    </div>
                    <p className="text-muted">Grupo: {user.grupo}</p>
                </Col>
            </Row>

            <Row>
                <Col md={6} className="mb-3">
                    <Card className="h-100 shadow-sm">
                        <Card.Body className="text-center">
                            <Card.Title>📦 Produtos</Card.Title>
                            <Card.Text>
                                Visualize e gerencie todos os produtos do sistema
                            </Card.Text>
                            <Button 
                                variant="primary" 
                                onClick={() => setCurrentView('products')}
                                className="w-100"
                            >
                                Listar Produtos
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {user.grupo === 'ADMIN' && (
                    <Col md={6} className="mb-3">
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
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
