import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EcommerceHeader from './EcommerceHeader';
import './AuthPage.css';

const AuthPage = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('login'); // 'login' ou 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado para Login
    const [loginData, setLoginData] = useState({
        email: '',
        senha: ''
    });

    // Estado para Cadastro
    const [registerData, setRegisterData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        telefone: '',
        endereco: {
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            uf: ''
        }
    });

    const handleLoginChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('endereco.')) {
            const field = name.split('.')[1];
            setRegisterData({
                ...registerData,
                endereco: {
                    ...registerData.endereco,
                    [field]: value
                }
            });
        } else {
            setRegisterData({
                ...registerData,
                [name]: value
            });
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Implementar lógica de login
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Salvar token e dados do usuário
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                
                // Notificar sobre o login
                onLoginSuccess(result.user);
                
                // Verificar se é admin ou usuário comum
                if (result.user.grupo === 'ADMIN') {
                    navigate('/dashboard');
                } else {
                    navigate('/minha-conta');
                }
            } else {
                setError(result.message || 'Email ou senha incorretos');
            }
        } catch (err) {
            console.error('Erro no login:', err);
            setError('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validações básicas
        if (registerData.senha !== registerData.confirmarSenha) {
            setError('As senhas não coincidem');
            setLoading(false);
            return;
        }

        if (registerData.senha.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            const cadastroData = {
                nome: registerData.nome,
                email: registerData.email,
                senha: registerData.senha,
                telefone: registerData.telefone,
                grupo: 'CLIENTE', // Definir como cliente por padrão
                endereco: registerData.endereco
            };

            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cadastroData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSuccess('Conta criada com sucesso! Você já pode fazer login.');
                setActiveTab('login');
                // Limpar formulário
                setRegisterData({
                    nome: '',
                    email: '',
                    senha: '',
                    confirmarSenha: '',
                    telefone: '',
                    endereco: {
                        cep: '',
                        logradouro: '',
                        numero: '',
                        complemento: '',
                        bairro: '',
                        cidade: '',
                        uf: ''
                    }
                });
            } else {
                setError(result.message || 'Erro ao criar conta');
            }
        } catch (err) {
            console.error('Erro no cadastro:', err);
            setError('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const buscarCEP = async (cep) => {
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                
                if (!data.erro) {
                    setRegisterData({
                        ...registerData,
                        endereco: {
                            ...registerData.endereco,
                            cep: cep,
                            logradouro: data.logradouro,
                            bairro: data.bairro,
                            cidade: data.localidade,
                            uf: data.uf
                        }
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
    };

    return (
        <div className="ecommerce-page">
            <EcommerceHeader />
            
            <div className="auth-container">
                <div className="auth-card">
                    {/* Tabs */}
                    <div className="auth-tabs">
                        <button 
                            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('login');
                                setError('');
                                setSuccess('');
                            }}
                        >
                            Entrar
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('register');
                                setError('');
                                setSuccess('');
                            }}
                        >
                            Criar Conta
                        </button>
                    </div>

                    {/* Messages */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Login Form */}
                    {activeTab === 'login' && (
                        <form onSubmit={handleLoginSubmit} className="auth-form">
                            <h2>Entre na sua conta</h2>
                            
                            <div className="form-group">
                                <label htmlFor="login-email">Email</label>
                                <input
                                    type="email"
                                    id="login-email"
                                    name="email"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    required
                                    placeholder="seu.email@exemplo.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="login-senha">Senha</label>
                                <input
                                    type="password"
                                    id="login-senha"
                                    name="senha"
                                    value={loginData.senha}
                                    onChange={handleLoginChange}
                                    required
                                    placeholder="Sua senha"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn-submit"
                                disabled={loading}
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>

                            <div className="form-footer">
                                <p>Não tem uma conta? 
                                    <span 
                                        className="link-text" 
                                        onClick={() => setActiveTab('register')}
                                    >
                                        Criar conta
                                    </span>
                                </p>
                            </div>
                        </form>
                    )}

                    {/* Register Form */}
                    {activeTab === 'register' && (
                        <form onSubmit={handleRegisterSubmit} className="auth-form">
                            <h2>Criar nova conta</h2>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="register-nome">Nome Completo *</label>
                                    <input
                                        type="text"
                                        id="register-nome"
                                        name="nome"
                                        value={registerData.nome}
                                        onChange={handleRegisterChange}
                                        required
                                        placeholder="Seu nome completo"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="register-telefone">Telefone</label>
                                    <input
                                        type="tel"
                                        id="register-telefone"
                                        name="telefone"
                                        value={registerData.telefone}
                                        onChange={handleRegisterChange}
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="register-email">Email *</label>
                                <input
                                    type="email"
                                    id="register-email"
                                    name="email"
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    required
                                    placeholder="seu.email@exemplo.com"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="register-senha">Senha *</label>
                                    <input
                                        type="password"
                                        id="register-senha"
                                        name="senha"
                                        value={registerData.senha}
                                        onChange={handleRegisterChange}
                                        required
                                        placeholder="Mínimo 6 caracteres"
                                        minLength={6}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="register-confirmar">Confirmar Senha *</label>
                                    <input
                                        type="password"
                                        id="register-confirmar"
                                        name="confirmarSenha"
                                        value={registerData.confirmarSenha}
                                        onChange={handleRegisterChange}
                                        required
                                        placeholder="Confirme sua senha"
                                    />
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="form-section">
                                <h3>Endereço</h3>
                                
                                <div className="form-row">
                                    <div className="form-group form-group-small">
                                        <label htmlFor="register-cep">CEP</label>
                                        <input
                                            type="text"
                                            id="register-cep"
                                            name="endereco.cep"
                                            value={registerData.endereco.cep}
                                            onChange={(e) => {
                                                handleRegisterChange(e);
                                                const cep = e.target.value.replace(/\D/g, '');
                                                if (cep.length === 8) {
                                                    buscarCEP(cep);
                                                }
                                            }}
                                            placeholder="00000-000"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="register-logradouro">Logradouro</label>
                                        <input
                                            type="text"
                                            id="register-logradouro"
                                            name="endereco.logradouro"
                                            value={registerData.endereco.logradouro}
                                            onChange={handleRegisterChange}
                                            placeholder="Rua, Avenida..."
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group form-group-small">
                                        <label htmlFor="register-numero">Número</label>
                                        <input
                                            type="text"
                                            id="register-numero"
                                            name="endereco.numero"
                                            value={registerData.endereco.numero}
                                            onChange={handleRegisterChange}
                                            placeholder="123"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="register-complemento">Complemento</label>
                                        <input
                                            type="text"
                                            id="register-complemento"
                                            name="endereco.complemento"
                                            value={registerData.endereco.complemento}
                                            onChange={handleRegisterChange}
                                            placeholder="Apto, Bloco..."
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="register-bairro">Bairro</label>
                                        <input
                                            type="text"
                                            id="register-bairro"
                                            name="endereco.bairro"
                                            value={registerData.endereco.bairro}
                                            onChange={handleRegisterChange}
                                            placeholder="Nome do bairro"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="register-cidade">Cidade</label>
                                        <input
                                            type="text"
                                            id="register-cidade"
                                            name="endereco.cidade"
                                            value={registerData.endereco.cidade}
                                            onChange={handleRegisterChange}
                                            placeholder="Nome da cidade"
                                        />
                                    </div>

                                    <div className="form-group form-group-small">
                                        <label htmlFor="register-uf">UF</label>
                                        <select
                                            id="register-uf"
                                            name="endereco.uf"
                                            value={registerData.endereco.uf}
                                            onChange={handleRegisterChange}
                                        >
                                            <option value="">UF</option>
                                            <option value="AC">AC</option>
                                            <option value="AL">AL</option>
                                            <option value="AP">AP</option>
                                            <option value="AM">AM</option>
                                            <option value="BA">BA</option>
                                            <option value="CE">CE</option>
                                            <option value="DF">DF</option>
                                            <option value="ES">ES</option>
                                            <option value="GO">GO</option>
                                            <option value="MA">MA</option>
                                            <option value="MT">MT</option>
                                            <option value="MS">MS</option>
                                            <option value="MG">MG</option>
                                            <option value="PA">PA</option>
                                            <option value="PB">PB</option>
                                            <option value="PR">PR</option>
                                            <option value="PE">PE</option>
                                            <option value="PI">PI</option>
                                            <option value="RJ">RJ</option>
                                            <option value="RN">RN</option>
                                            <option value="RS">RS</option>
                                            <option value="RO">RO</option>
                                            <option value="RR">RR</option>
                                            <option value="SC">SC</option>
                                            <option value="SP">SP</option>
                                            <option value="SE">SE</option>
                                            <option value="TO">TO</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn-submit"
                                disabled={loading}
                            >
                                {loading ? 'Criando conta...' : 'Criar Conta'}
                            </button>

                            <div className="form-footer">
                                <p>Já tem uma conta? 
                                    <span 
                                        className="link-text" 
                                        onClick={() => setActiveTab('login')}
                                    >
                                        Fazer login
                                    </span>
                                </p>
                            </div>
                        </form>
                    )}

                    {/* Back Button */}
                    <div className="back-to-home">
                        <button 
                            className="btn-back-home"
                            onClick={() => navigate('/')}
                        >
                            ← Voltar à Página Inicial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
