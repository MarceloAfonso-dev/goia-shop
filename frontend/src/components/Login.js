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
        <div style={{ minHeight: '100vh', backgroundColor: '#F1F2F4', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: '0', margin: '0' }}>
            {/* GOI Header */}
            <header className="goi-header" style={{ width: '100%' }}>
                <div className="goi-logo">
                    <h1>GOIA Shop</h1>
                </div>
                <button 
                    className="btn btn-secondary" 
                    onClick={onBackToLanding}
                    style={{ marginLeft: 'auto' }}
                >
                    ← Voltar à página inicial
                </button>
            </header>

            <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                    backgroundColor: '#ffffff', 
                    padding: '40px', 
                    borderRadius: '12px', 
                    border: '1px solid #eee',
                    boxShadow: '0 1px 5px rgba(0,0,0,0.05)', 
                    width: '100%', 
                    maxWidth: '400px',
                    marginTop: '60px',
                    marginBottom: '60px'
                }}>
                    <h2 style={{ 
                        fontSize: '24px', 
                        fontWeight: '600', 
                        marginBottom: '8px',
                        color: '#1c1c1c',
                        textAlign: 'left'
                    }}>
                        Acesso ao Sistema
                    </h2>
                    <p style={{ 
                        fontSize: '14px', 
                        color: '#555', 
                        marginBottom: '24px',
                        textAlign: 'left'
                    }}>
                        Faça login para acessar o backoffice
                    </p>

                    {error && (
                        <div style={{ 
                            backgroundColor: '#ffe6e6', 
                            color: '#d90000', 
                            padding: '12px', 
                            borderRadius: '8px', 
                            marginBottom: '20px',
                            border: '1px solid #ffcccc'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Digite seu email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Senha</label>
                            <input
                                type="password"
                                name="senha"
                                className="form-control"
                                value={formData.senha}
                                onChange={handleChange}
                                placeholder="Digite sua senha"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', marginTop: '10px' }}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div style={{ 
                        textAlign: 'center', 
                        marginTop: '30px', 
                        padding: '20px', 
                        backgroundColor: '#f9f9f9', 
                        borderRadius: '8px',
                        border: '1px solid #eee'
                    }}>
                        <small style={{ color: '#555', fontSize: '12px' }}>
                            <strong>Usuários de teste:</strong><br/>
                            Admin: admin@goiashop.com / adm123<br/>
                            Estoquista: estoquista@goiashop.com / estoque123<br/>
                            <span style={{ color: '#007e33', fontWeight: '500' }}>🔒 Senhas protegidas com BCrypt</span>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
