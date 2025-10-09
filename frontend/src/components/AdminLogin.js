import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../utils/api';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Verificar se há cliente logado
            const existingUser = localStorage.getItem('user');
            const existingUserType = localStorage.getItem('userType');
            
            if (existingUser && existingUserType === 'cliente') {
                const userData = JSON.parse(existingUser);
                if (userData.grupo === 'CLIENTE' || !userData.grupo) {
                    setError('Há um cliente logado. Faça logout do cliente primeiro para acessar o backoffice.');
                    setLoading(false);
                    return;
                }
            }

            const response = await api.post('/auth/login', formData);
            
            if (response.data.success) {
                const user = response.data.user;
                
                // Verificar se é admin ou estoquista
                if (user.grupo === 'ADMIN' || user.grupo === 'ESTOQUISTA') {
                    // Limpar qualquer sessão anterior completamente
                    localStorage.clear();
                    
                    // Salvar dados do backoffice com tipo específico
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('userType', 'backoffice');
                    
                    // Redirecionar para o dashboard
                    window.location.href = '/dashboard';
                } else {
                    setError('Acesso negado. Área restrita para funcionários (ADMIN/ESTOQUISTA).');
                }
            } else {
                setError(response.data.message || 'Credenciais inválidas');
            }
        } catch (err) {
            console.error('Erro no login admin:', err);
            if (err.response?.status === 401) {
                setError('Email ou senha incorretos');
            } else if (err.code === 'ECONNREFUSED') {
                setError('Servidor offline. Verifique se o backend está rodando.');
            } else {
                setError('Erro de conexão com o servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Row className="w-100">
                <Col md={6} lg={4} className="mx-auto">
                    <Card className="shadow-sm">
                        <Card.Header className="bg-dark text-white text-center py-3">
                            <h4 className="mb-1">🔒 Admin Login</h4>
                            <small>GOIA Shop - Área Restrita</small>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="seu@email.com"
                                        required
                                        autoFocus
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Senha</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="senha"
                                        value={formData.senha}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button 
                                        variant="dark" 
                                        type="submit" 
                                        disabled={loading}
                                        size="lg"
                                    >
                                        {loading ? '🔄 Autenticando...' : '🚀 Entrar'}
                                    </Button>
                                    
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={() => navigate('/')}
                                        size="sm"
                                    >
                                        ← Voltar para o site
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                        <Card.Footer className="text-center bg-light">
                            <small className="text-muted">
                                <strong>Contas de teste:</strong><br/>
                                admin@goiashop.com / adm123<br/>
                                estoquista@goiashop.com / estoque123
                            </small>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminLogin;
