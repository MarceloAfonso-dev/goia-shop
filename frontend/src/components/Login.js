import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../utils/api';

const Login = ({ onLoginSuccess, onBackToLanding }) => {
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
            // Envia a senha original diretamente para o backend
            // O backend será responsável por toda a criptografia (BCrypt)
            const loginPayload = {
                email: formData.email,
                senha: formData.senha  // Senha original, sem criptografia no frontend
            };
            
            // Envia para o backend
            const response = await api.post('/auth/login', loginPayload);
            
            if (response.data.success) {
                // Salvar token e dados do usuário
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Notificar componente pai sobre o login
                onLoginSuccess(response.data.user);
            } else {
                setError(response.data.message || 'Erro no login');
            }
        } catch (err) {
            console.error('Erro no login:', err);
            
            if (err.response?.status === 401) {
                setError('Email ou senha incorretos');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.code === 'ECONNREFUSED') {
                setError('Servidor não está rodando. Verifique se o backend está ativo.');
            } else {
                setError('Erro ao conectar com o servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Row className="w-100">
                <Col md={6} className="mx-auto">
                    <Card className="shadow">
                        <Card.Header className="bg-primary text-white text-center">
                            <div className="d-flex justify-content-between align-items-center">
                                <Button 
                                    variant="outline-light" 
                                    size="sm" 
                                    onClick={onBackToLanding}
                                    className="me-2"
                                >
                                    ← Voltar
                                </Button>
                                <div className="flex-grow-1">
                                    <h3>GOIA Shop - Backoffice</h3>
                                    <p className="mb-0">Faça login para acessar o sistema</p>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Digite seu email"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Senha</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="senha"
                                        value={formData.senha}
                                        onChange={handleChange}
                                        placeholder="Digite sua senha"
                                        required
                                    />
                                </Form.Group>

                                <Button 
                                    variant="primary" 
                                    type="submit" 
                                    className="w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Entrando...' : 'Entrar'}
                                </Button>
                            </Form>
                        </Card.Body>
                        <Card.Footer className="text-center text-muted">
                            <small>Usuários de teste:</small><br/>
                            <small>Admin: admin@goiashop.com / adm123</small><br/>
                            <small>Estoquista: estoquista@goiashop.com / estoque123</small><br/>
                            <small className="text-success">🔒 Senhas protegidas com BCrypt no servidor</small>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
