import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EcommerceHeader from './EcommerceHeader';
import { useAuth } from '../hooks/useAuth';
import './AuthPage.css';

const AuthPage = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
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
        cpf: '',
        telefone: '',
        dataNascimento: '',
        senha: '',
        confirmarSenha: '',
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
        let formattedValue = value;
        
        // Formatação automática
        if (name === 'cpf') {
            // Remove tudo que não é dígito
            const numbers = value.replace(/\D/g, '');
            // Aplica máscara: 000.000.000-00
            formattedValue = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (name === 'telefone') {
            // Remove tudo que não é dígito e limita a 11 dígitos
            const numbers = value.replace(/\D/g, '').substring(0, 11);
            // Aplica máscara: (00) 00000-0000 ou (00) 0000-0000
            if (numbers.length <= 10) {
                formattedValue = numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                formattedValue = numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
        } else if (name === 'dataNascimento') {
            // Remove tudo que não é dígito e limita a 8 dígitos
            const numbers = value.replace(/\D/g, '').substring(0, 8);
            // Aplica máscara: DD/MM/AAAA
            if (numbers.length >= 2) {
                if (numbers.length >= 4) {
                    formattedValue = numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
                } else {
                    formattedValue = numbers.replace(/(\d{2})(\d{2})/, '$1/$2');
                }
            } else {
                formattedValue = numbers;
            }
        }
        
        if (name.startsWith('endereco.')) {
            const field = name.split('.')[1];
            let enderecoValue = formattedValue;
            
            // Formatação do CEP
            if (field === 'cep') {
                const numbers = formattedValue.replace(/\D/g, '');
                enderecoValue = numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
            }
            
            setRegisterData({
                ...registerData,
                endereco: {
                    ...registerData.endereco,
                    [field]: enderecoValue
                }
            });
        } else {
            setRegisterData({
                ...registerData,
                [name]: formattedValue
            });
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Verificar se há usuário do backoffice logado
            const existingUser = localStorage.getItem('user');
            const existingUserType = localStorage.getItem('userType');
            
            if (existingUser && existingUserType === 'backoffice') {
                const userData = JSON.parse(existingUser);
                if (userData.grupo === 'ADMIN' || userData.grupo === 'ESTOQUISTA') {
                    setError('Há um usuário do backoffice logado. Faça logout do backoffice primeiro.');
                    setLoading(false);
                    return;
                }
            }

            // Login de cliente - usar endpoint específico
            const response = await fetch('http://localhost:8080/api/auth/login-cliente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Limpar qualquer sessão anterior
                localStorage.clear();
                
                // Salvar token e dados do cliente
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('userType', 'cliente');
                
                // Notificar sobre o login
                onLoginSuccess(result.user);
                
                // Para clientes, navegar para a página inicial ou conta
                if (result.user.tipo === 'CLIENTE') {
                    navigate('/');
                } else {
                    navigate('/minha-conta');
                }
            } else {
                const errorMsg = typeof result.message === 'string' ? result.message : 'Email ou senha incorretos';
                setError(errorMsg);
            }
        } catch (err) {
            console.error('Erro no login:', err);
            if (err.response?.data?.message && typeof err.response.data.message === 'string') {
                setError(err.response.data.message);
            } else {
                setError('Erro ao conectar com o servidor');
            }
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
        if (!registerData.nome || !registerData.email || !registerData.cpf || !registerData.telefone || !registerData.dataNascimento) {
            setError('Todos os campos obrigatórios devem ser preenchidos');
            setLoading(false);
            return;
        }

        // Validar nome
        if (registerData.nome.trim().length < 2) {
            setError('Nome deve ter pelo menos 2 caracteres');
            setLoading(false);
            return;
        }

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

        // Validar CPF (básico)
        const cpfNumbers = registerData.cpf.replace(/\D/g, '');
        if (cpfNumbers.length !== 11) {
            setError('CPF deve ter 11 dígitos');
            setLoading(false);
            return;
        }

        // Validar telefone
        const phoneNumbers = registerData.telefone.replace(/\D/g, '');
        if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
            setError('Telefone deve ter 10 ou 11 dígitos');
            setLoading(false);
            return;
        }

        // Validar data de nascimento
        const dateNumbers = registerData.dataNascimento.replace(/\D/g, '');
        if (dateNumbers.length !== 8) {
            setError('Data de nascimento deve ter 8 dígitos (DD/MM/AAAA)');
            setLoading(false);
            return;
        }

        // Verificar se é uma data válida
        if (registerData.dataNascimento.includes('/')) {
            const [dia, mes, ano] = registerData.dataNascimento.split('/');
            const data = new Date(ano, mes - 1, dia);
            if (data.getDate() != dia || data.getMonth() + 1 != mes || data.getFullYear() != ano) {
                setError('Data de nascimento inválida');
                setLoading(false);
                return;
            }
        }

        // Validar campos de endereço obrigatórios
        if (!registerData.endereco.cep || !registerData.endereco.logradouro || 
            !registerData.endereco.numero || !registerData.endereco.bairro || 
            !registerData.endereco.cidade || !registerData.endereco.uf) {
            setError('Todos os campos de endereço são obrigatórios');
            setLoading(false);
            return;
        }

        // Validar formato do CEP
        const cepNumbers = registerData.endereco.cep.replace(/\D/g, '');
        if (cepNumbers.length !== 8) {
            setError('CEP deve ter 8 dígitos');
            setLoading(false);
            return;
        }

        try {
            // Converter data de DD/MM/AAAA para AAAA-MM-DD
            let dataFormatada = registerData.dataNascimento;
            if (registerData.dataNascimento.includes('/')) {
                const [dia, mes, ano] = registerData.dataNascimento.split('/');
                dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            }

            const cadastroData = {
                nome: registerData.nome,
                email: registerData.email,
                cpf: registerData.cpf.replace(/\D/g, ''), // Remove formatação
                telefone: registerData.telefone,
                dataNascimento: dataFormatada,
                senha: registerData.senha,
                // Campos de endereço no nível raiz
                cep: registerData.endereco.cep, // Manter formatação XXXXX-XXX
                logradouro: registerData.endereco.logradouro,
                numero: registerData.endereco.numero,
                complemento: registerData.endereco.complemento,
                bairro: registerData.endereco.bairro,
                cidade: registerData.endereco.cidade,
                estado: registerData.endereco.uf
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
                    cpf: '',
                    telefone: '',
                    dataNascimento: '',
                    senha: '',
                    confirmarSenha: '',
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
                const errorMsg = typeof result.message === 'string' ? result.message : 'Erro ao criar conta';
                setError(errorMsg);
            }
        } catch (err) {
            console.error('Erro no cadastro:', err);
            if (err.response?.data?.message && typeof err.response.data.message === 'string') {
                setError(err.response.data.message);
            } else {
                setError('Erro ao conectar com o servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        setSuccess('Logout realizado com sucesso!');
        setTimeout(() => {
            navigate('/');
        }, 1500);
    };

    const buscarCEP = async (cep) => {
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                
                if (!data.erro) {
                    // Formatar CEP para XXXXX-XXX
                    const cepFormatado = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
                    
                    setRegisterData({
                        ...registerData,
                        endereco: {
                            ...registerData.endereco,
                            cep: cepFormatado,
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

    // Se usuário já está logado, mostrar interface de logout
    if (user) {
        return (
            <div className="landing-page">
                <EcommerceHeader />
                
                <div style={{ 
                    minHeight: '100vh', 
                    backgroundColor: '#F1F2F4',
                    paddingTop: '40px',
                    paddingBottom: '60px'
                }}>
                    <div className="auth-container">
                    <div className="auth-card logged-in-card">
                        <div className="user-info">
                            <div className="user-avatar">
                                <div className="avatar-circle">
                                    {user.nome?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </div>
                            
                            <h2>Olá, {user.nome}!</h2>
                            <p className="user-email">{user.email}</p>
                            <p className="user-type">
                                {user.tipo === 'CLIENTE' ? '👤 Cliente' :
                                 user.tipo === 'ADMIN' ? '👑 Administrador' : 
                                 '📦 Estoquista'}
                            </p>
                            
                            {success && <div className="success-message">{success}</div>}
                            
                            <div className="logout-actions">
                                <button 
                                    className="btn-primary btn-large logout-btn"
                                    onClick={handleLogout}
                                    disabled={loading}
                                >
                                    {loading ? 'Saindo...' : '🚪 Sair da Conta'}
                                </button>
                                
                                <button 
                                    className="btn-secondary btn-large"
                                    onClick={() => navigate('/')}
                                >
                                    🏠 Voltar ao Início
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        );
    }

    return (
        <div className="landing-page">
            <EcommerceHeader />
            
            <div style={{ 
                minHeight: '100vh', 
                backgroundColor: '#F1F2F4',
                paddingTop: '40px',
                paddingBottom: '60px'
            }}>
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
                                    <label htmlFor="register-cpf">CPF *</label>
                                    <input
                                        type="text"
                                        id="register-cpf"
                                        name="cpf"
                                        value={registerData.cpf}
                                        onChange={handleRegisterChange}
                                        required
                                        placeholder="000.000.000-00"
                                        maxLength={14}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="register-dataNascimento">Data de Nascimento *</label>
                                    <input
                                        type="text"
                                        id="register-dataNascimento"
                                        name="dataNascimento"
                                        value={registerData.dataNascimento}
                                        onChange={handleRegisterChange}
                                        required
                                        placeholder="DD/MM/AAAA"
                                        maxLength={10}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="register-telefone">Telefone *</label>
                                    <input
                                        type="tel"
                                        id="register-telefone"
                                        name="telefone"
                                        value={registerData.telefone}
                                        onChange={handleRegisterChange}
                                        required
                                        placeholder="(11) 99999-9999"
                                        maxLength={15}
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
                                        <label htmlFor="register-cep">CEP *</label>
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
                                            required
                                            placeholder="00000-000"
                                            maxLength={9}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="register-logradouro">Logradouro *</label>
                                        <input
                                            type="text"
                                            id="register-logradouro"
                                            name="endereco.logradouro"
                                            value={registerData.endereco.logradouro}
                                            onChange={handleRegisterChange}
                                            required
                                            placeholder="Rua, Avenida..."
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group form-group-small">
                                        <label htmlFor="register-numero">Número *</label>
                                        <input
                                            type="text"
                                            id="register-numero"
                                            name="endereco.numero"
                                            value={registerData.endereco.numero}
                                            onChange={handleRegisterChange}
                                            required
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
                                        <label htmlFor="register-bairro">Bairro *</label>
                                        <input
                                            type="text"
                                            id="register-bairro"
                                            name="endereco.bairro"
                                            value={registerData.endereco.bairro}
                                            onChange={handleRegisterChange}
                                            required
                                            placeholder="Nome do bairro"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="register-cidade">Cidade *</label>
                                        <input
                                            type="text"
                                            id="register-cidade"
                                            name="endereco.cidade"
                                            value={registerData.endereco.cidade}
                                            onChange={handleRegisterChange}
                                            required
                                            placeholder="Nome da cidade"
                                        />
                                    </div>

                                    <div className="form-group form-group-small">
                                        <label htmlFor="register-uf">UF *</label>
                                        <select
                                            id="register-uf"
                                            name="endereco.uf"
                                            value={registerData.endereco.uf}
                                            onChange={handleRegisterChange}
                                            required
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
        </div>
    );
};

export default AuthPage;
