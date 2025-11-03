import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import EcommerceHeader from './EcommerceHeader';
import api from '../utils/api';
import './MyAccountPage.css';

const MyAccountPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [editProfileData, setEditProfileData] = useState({});
    const [showAddAddressModal, setShowAddAddressModal] = useState(false);
    const [showEditAddressModal, setShowEditAddressModal] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        apelido: '',
        isPadrao: false
    });
    const [cepLoading, setCepLoading] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showSecurityHistoryModal, setShowSecurityHistoryModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });
    const [securityLogs, setSecurityLogs] = useState([]);

    useEffect(() => {
        // Verificar se há token
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        
        if (!token || !userType || userType !== 'cliente') {
            navigate('/login');
            return;
        }

        // Se for admin, redirecionar para dashboard
        if (user?.grupo === 'ADMIN' || user?.grupo === 'ESTOQUISTA') {
            navigate('/dashboard');
            return;
        }

        // Carregar dados do perfil e pedidos
        loadUserProfile();
        loadOrders();
        loadAddresses();
        
        // Inicializar dados de edição
        if (user) {
            setEditProfileData({
                nome: user.nome || '',
                telefone: user.telefone || '',
                dataNascimento: user.dataNascimento || '',
                genero: user.genero || ''
            });
        }
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

    const loadOrders = async () => {
        try {
            console.log('Carregando pedidos...');
            
            // Usando a api que já tem interceptors
            const response = await api.get('/pedidos');
            
            console.log('Pedidos carregados:', response.data);
            setOrders(response.data);
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        }
    };

    const loadAddresses = async () => {
        try {
            console.log('Carregando endereços...');
            
            // Usando a api que já tem interceptors
            const response = await api.get('/enderecos');
            
            console.log('Endereços carregados:', response.data);
            
            setAddresses(response.data.enderecos || []);
        } catch (error) {
            console.error('Erro ao carregar endereços:', error);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            console.log('Salvando perfil com dados:', editProfileData);
            
            // Usando a api que já tem interceptors
            const response = await api.put('/cliente/perfil', editProfileData);
            
            console.log('Resposta do servidor:', response.data);
            
            if (response.data.success) {
                // Atualizar dados do usuário no localStorage
                const updatedUser = { ...user, ...editProfileData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                alert('Perfil atualizado com sucesso!');
                setActiveSection('profile');
                
                // Recarregar dados do usuário
                window.location.reload(); // Força reload para garantir que tudo seja atualizado
            } else {
                alert('Erro: ' + (response.data.message || 'Falha ao atualizar perfil'));
            }
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            const errorMsg = error.response?.data?.message || 'Erro ao salvar perfil. Tente novamente.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAddressForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCepChange = async (e) => {
        const cep = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        
        // Formatar CEP com máscara
        let formattedCep = cep;
        if (cep.length >= 6) {
            formattedCep = cep.slice(0, 5) + '-' + cep.slice(5, 8);
        }
        
        setAddressForm(prev => ({
            ...prev,
            cep: formattedCep
        }));

        // Se CEP tem 8 dígitos, buscar dados
        if (cep.length === 8) {
            setCepLoading(true);
            try {
                const response = await api.get(`/enderecos/consultar-cep/${cep}`);
                
                if (response.data.success) {
                    const endereco = response.data.endereco;
                    setAddressForm(prev => ({
                        ...prev,
                        logradouro: endereco.logradouro || '',
                        bairro: endereco.bairro || '',
                        cidade: endereco.cidade || '',
                        estado: endereco.estado || '',
                        complemento: endereco.complemento || prev.complemento // Mantém o complemento atual se não vier da API
                    }));
                }
            } catch (error) {
                console.error('Erro ao consultar CEP:', error);
                // Não exibir erro para não incomodar o usuário, apenas não preenche
            } finally {
                setCepLoading(false);
            }
        }
    };

    const handleSaveAddress = async () => {
        try {
            setLoading(true);
            console.log('Salvando endereço com dados:', addressForm);
            
            // Validação básica
            if (!addressForm.cep || !addressForm.logradouro || !addressForm.numero || !addressForm.bairro || !addressForm.cidade || !addressForm.estado) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            // Remover máscara do CEP
            const addressData = {
                ...addressForm,
                cep: addressForm.cep.replace(/\D/g, '')
            };
            
            // Usando a api que já tem interceptors
            const response = editingAddressId 
                ? await api.put(`/enderecos/${editingAddressId}`, addressData)
                : await api.post('/enderecos', addressData);
            
            console.log('Resposta do servidor:', response.data);
            
            if (response.data.success) {
                alert(editingAddressId ? 'Endereço atualizado com sucesso!' : 'Endereço adicionado com sucesso!');
                setShowAddAddressModal(false);
                setShowEditAddressModal(false);
                setEditingAddressId(null);
                setAddressForm({
                    cep: '',
                    logradouro: '',
                    numero: '',
                    complemento: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                    apelido: '',
                    isPadrao: false
                });
                loadAddresses(); // Recarrega a lista
            } else {
                alert('Erro: ' + (response.data.message || 'Falha ao salvar endereço'));
            }
        } catch (error) {
            console.error('Erro ao salvar endereço:', error);
            const errorMsg = error.response?.data?.message || 'Erro ao salvar endereço. Tente novamente.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Deseja realmente excluir este endereço?')) return;
        
        try {
            console.log('Deletando endereço:', addressId);
            
            // Usando a api que já tem interceptors
            const response = await api.delete(`/enderecos/${addressId}`);
            
            console.log('Resposta do servidor:', response.data);
            
            if (response.data.success) {
                alert('Endereço excluído com sucesso!');
                loadAddresses(); // Recarrega a lista
            } else {
                alert('Erro: ' + (response.data.message || 'Falha ao excluir endereço'));
            }
        } catch (error) {
            console.error('Erro ao excluir endereço:', error);
            const errorMsg = error.response?.data?.message || 'Erro ao excluir endereço. Tente novamente.';
            alert(errorMsg);
        }
    };

    const handleEditAddress = (address) => {
        setEditingAddressId(address.id);
        setAddressForm({
            cep: address.cep || '',
            logradouro: address.logradouro || '',
            numero: address.numero || '',
            complemento: address.complemento || '',
            bairro: address.bairro || '',
            cidade: address.cidade || '',
            estado: address.estado || '',
            apelido: address.apelido || '',
            isPadrao: address.isPadrao || false
        });
        setShowEditAddressModal(true);
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChangePassword = async () => {
        try {
            setLoading(true);

            // Validações básicas
            if (!passwordForm.senhaAtual || !passwordForm.novaSenha || !passwordForm.confirmarSenha) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            if (passwordForm.novaSenha !== passwordForm.confirmarSenha) {
                alert('Nova senha e confirmação não coincidem.');
                return;
            }

            if (!/^\d{6}$/.test(passwordForm.novaSenha)) {
                alert('Nova senha deve conter exatamente 6 dígitos numéricos.');
                return;
            }

            // Fazer a requisição
            const response = await api.post('/cliente/alterar-senha', passwordForm);

            if (response.data.success) {
                alert('Senha alterada com sucesso!');
                setShowChangePasswordModal(false);
                setPasswordForm({
                    senhaAtual: '',
                    novaSenha: '',
                    confirmarSenha: ''
                });
            } else {
                alert('Erro: ' + (response.data.message || 'Falha ao alterar senha'));
            }

        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            const errorMsg = error.response?.data?.message || 'Erro ao alterar senha. Tente novamente.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const loadSecurityHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cliente/historico-seguranca');
            
            if (response.data.success) {
                setSecurityLogs(response.data.logs || []);
            }
        } catch (error) {
            console.error('Erro ao carregar histórico de segurança:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShowSecurityHistory = () => {
        setShowSecurityHistoryModal(true);
        loadSecurityHistory();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDENTE': '#ffa500',
            'CONFIRMADO': '#007bff', 
            'PAGO': '#28a745',
            'PROCESSANDO': '#17a2b8',
            'ENVIADO': '#6f42c1',
            'ENTREGUE': '#28a745',
            'CANCELADO': '#dc3545'
        };
        return colors[status] || '#6c757d';
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

                                    <button 
                                        className="btn-edit-profile"
                                        onClick={() => setActiveSection('edit-profile')}
                                    >
                                        ✏️ Editar Perfil
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'edit-profile' && (
                            <div className="section-content">
                                <div className="section-header">
                                    <h2>Editar Perfil</h2>
                                    <p>Atualize suas informações pessoais</p>
                                </div>

                                <div className="edit-profile-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Nome Completo</label>
                                            <input 
                                                type="text" 
                                                value={editProfileData.nome || ''}
                                                onChange={(e) => setEditProfileData(prev => ({...prev, nome: e.target.value}))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>E-mail</label>
                                            <input type="email" value={user?.email || ''} disabled />
                                        </div>
                                        <div className="form-group">
                                            <label>Telefone</label>
                                            <input 
                                                type="tel" 
                                                value={editProfileData.telefone || ''}
                                                onChange={(e) => setEditProfileData(prev => ({...prev, telefone: e.target.value}))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>CPF</label>
                                            <input type="text" value={user?.cpf || ''} disabled />
                                        </div>
                                        <div className="form-group">
                                            <label>Data de Nascimento</label>
                                            <input 
                                                type="date" 
                                                value={editProfileData.dataNascimento || ''}
                                                onChange={(e) => setEditProfileData(prev => ({...prev, dataNascimento: e.target.value}))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Gênero</label>
                                            <select 
                                                value={editProfileData.genero || ''}
                                                onChange={(e) => setEditProfileData(prev => ({...prev, genero: e.target.value}))}
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="MASCULINO">Masculino</option>
                                                <option value="FEMININO">Feminino</option>
                                                <option value="OUTRO">Outro</option>
                                                <option value="NAO_INFORMADO">Não informado</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="form-actions">
                                        <button 
                                            className="btn-cancel"
                                            onClick={() => setActiveSection('profile')}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            className="btn-save"
                                            onClick={handleSaveProfile}
                                            disabled={loading}
                                        >
                                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                                        </button>
                                    </div>
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
                                    {orders.length === 0 ? (
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
                                    ) : (
                                        <div className="orders-table-container">
                                            <table className="orders-table">
                                                <thead>
                                                    <tr>
                                                        <th>Nº Pedido</th>
                                                        <th>Data</th>
                                                        <th>Valor Total</th>
                                                        <th>Status</th>
                                                        <th>Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.map(order => (
                                                        <tr key={order.id}>
                                                            <td className="order-number">
                                                                <strong>{order.numeroPedido}</strong>
                                                            </td>
                                                            <td>{formatDate(order.createdAt)}</td>
                                                            <td>{formatCurrency(order.valorTotal)}</td>
                                                            <td>
                                                                <span 
                                                                    className="status-badge"
                                                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                                                >
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button 
                                                                    className="btn-details"
                                                                    onClick={() => navigate(`/pedido/${order.id}`)}
                                                                >
                                                                    Ver Detalhes
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
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
                                    {addresses.length === 0 ? (
                                        <div className="empty-addresses">
                                            <div className="empty-icon">📍</div>
                                            <h3>Nenhum endereço cadastrado</h3>
                                            <p>Adicione um endereço para facilitar suas compras</p>
                                            <button 
                                                className="btn-add-address"
                                                onClick={() => setShowAddAddressModal(true)}
                                            >
                                                ➕ Adicionar Endereço
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="addresses-grid">
                                            {addresses.map(address => (
                                                <div key={address.id} className="address-card">
                                                    <div className="address-header">
                                                        <h4>{address.apelido || 'Endereço'}</h4>
                                                        {address.isPadrao && <span className="badge-default">Padrão</span>}
                                                    </div>
                                                    <div className="address-details">
                                                        <p>{address.logradouro}, {address.numero}</p>
                                                        {address.complemento && <p>{address.complemento}</p>}
                                                        <p>{address.bairro}</p>
                                                        <p>{address.cidade} - {address.estado}</p>
                                                        <p>CEP: {address.cep}</p>
                                                    </div>
                                                    <div className="address-actions">
                                                        <button 
                                                            className="btn-edit-address"
                                                            onClick={() => handleEditAddress(address)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button 
                                                            className="btn-delete-address"
                                                            onClick={() => handleDeleteAddress(address.id)}
                                                        >
                                                            Excluir
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="add-address-card">
                                                <button 
                                                    className="btn-add-address-full"
                                                    onClick={() => setShowAddAddressModal(true)}
                                                >
                                                    ➕ Adicionar Novo Endereço
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
                                        <button 
                                            className="btn-change-password"
                                            onClick={() => setShowChangePasswordModal(true)}
                                        >
                                            🔑 Alterar Senha
                                        </button>
                                    </div>

                                    <div className="security-item">
                                        <div className="security-info">
                                            <h4>Histórico de Segurança</h4>
                                            <p>Visualize seu histórico de atividades</p>
                                        </div>
                                        <button 
                                            className="btn-view-history"
                                            onClick={handleShowSecurityHistory}
                                        >
                                            📋 Ver Histórico
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Adicionar Endereço */}
            {showAddAddressModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Adicionar Novo Endereço</h3>
                            <button 
                                className="btn-close"
                                onClick={() => setShowAddAddressModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>CEP</label>
                                    <div className="input-with-loading">
                                        <input 
                                            type="text" 
                                            name="cep"
                                            value={addressForm.cep}
                                            onChange={handleCepChange}
                                            placeholder="00000-000"
                                            maxLength="9"
                                        />
                                        {cepLoading && <span className="loading-indicator">🔄</span>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Logradouro</label>
                                    <input 
                                        type="text" 
                                        name="logradouro"
                                        value={addressForm.logradouro}
                                        onChange={handleAddressChange}
                                        placeholder="Rua, Avenida..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Número</label>
                                    <input 
                                        type="text" 
                                        name="numero"
                                        value={addressForm.numero}
                                        onChange={handleAddressChange}
                                        placeholder="123"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Complemento</label>
                                    <input 
                                        type="text" 
                                        name="complemento"
                                        value={addressForm.complemento}
                                        onChange={handleAddressChange}
                                        placeholder="Apto, Casa..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bairro</label>
                                    <input 
                                        type="text" 
                                        name="bairro"
                                        value={addressForm.bairro}
                                        onChange={handleAddressChange}
                                        placeholder="Bairro"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Cidade</label>
                                    <input 
                                        type="text" 
                                        name="cidade"
                                        value={addressForm.cidade}
                                        onChange={handleAddressChange}
                                        placeholder="Cidade"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Estado</label>
                                    <select 
                                        name="estado"
                                        value={addressForm.estado}
                                        onChange={handleAddressChange}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="AC">Acre</option>
                                        <option value="AL">Alagoas</option>
                                        <option value="AP">Amapá</option>
                                        <option value="AM">Amazonas</option>
                                        <option value="BA">Bahia</option>
                                        <option value="CE">Ceará</option>
                                        <option value="DF">Distrito Federal</option>
                                        <option value="ES">Espírito Santo</option>
                                        <option value="GO">Goiás</option>
                                        <option value="MA">Maranhão</option>
                                        <option value="MT">Mato Grosso</option>
                                        <option value="MS">Mato Grosso do Sul</option>
                                        <option value="MG">Minas Gerais</option>
                                        <option value="PA">Pará</option>
                                        <option value="PB">Paraíba</option>
                                        <option value="PR">Paraná</option>
                                        <option value="PE">Pernambuco</option>
                                        <option value="PI">Piauí</option>
                                        <option value="RJ">Rio de Janeiro</option>
                                        <option value="RN">Rio Grande do Norte</option>
                                        <option value="RS">Rio Grande do Sul</option>
                                        <option value="RO">Rondônia</option>
                                        <option value="RR">Roraima</option>
                                        <option value="SC">Santa Catarina</option>
                                        <option value="SP">São Paulo</option>
                                        <option value="SE">Sergipe</option>
                                        <option value="TO">Tocantins</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Apelido (opcional)</label>
                                    <input 
                                        type="text" 
                                        name="apelido"
                                        value={addressForm.apelido}
                                        onChange={handleAddressChange}
                                        placeholder="Casa, Trabalho..."
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="isPadrao"
                                            checked={addressForm.isPadrao}
                                            onChange={handleAddressChange}
                                        />
                                        <span className="checkmark"></span>
                                        Definir como endereço padrão
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-cancel"
                                onClick={() => setShowAddAddressModal(false)}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="btn-save"
                                onClick={handleSaveAddress}
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : 'Salvar Endereço'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Editar Endereço */}
            {showEditAddressModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Editar Endereço</h3>
                            <button 
                                className="btn-close"
                                onClick={() => {
                                    setShowEditAddressModal(false);
                                    setEditingAddressId(null);
                                    setAddressForm({
                                        cep: '',
                                        logradouro: '',
                                        numero: '',
                                        complemento: '',
                                        bairro: '',
                                        cidade: '',
                                        estado: '',
                                        apelido: '',
                                        isPadrao: false
                                    });
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>CEP</label>
                                    <div className="input-with-loading">
                                        <input 
                                            type="text" 
                                            name="cep"
                                            value={addressForm.cep}
                                            onChange={handleCepChange}
                                            placeholder="00000-000"
                                            maxLength="9"
                                        />
                                        {cepLoading && <span className="loading-indicator">🔄</span>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Logradouro</label>
                                    <input 
                                        type="text" 
                                        name="logradouro"
                                        value={addressForm.logradouro}
                                        onChange={handleAddressChange}
                                        placeholder="Rua, Avenida..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Número</label>
                                    <input 
                                        type="text" 
                                        name="numero"
                                        value={addressForm.numero}
                                        onChange={handleAddressChange}
                                        placeholder="123"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Complemento</label>
                                    <input 
                                        type="text" 
                                        name="complemento"
                                        value={addressForm.complemento}
                                        onChange={handleAddressChange}
                                        placeholder="Apto, Casa..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bairro</label>
                                    <input 
                                        type="text" 
                                        name="bairro"
                                        value={addressForm.bairro}
                                        onChange={handleAddressChange}
                                        placeholder="Bairro"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Cidade</label>
                                    <input 
                                        type="text" 
                                        name="cidade"
                                        value={addressForm.cidade}
                                        onChange={handleAddressChange}
                                        placeholder="Cidade"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Estado</label>
                                    <select 
                                        name="estado"
                                        value={addressForm.estado}
                                        onChange={handleAddressChange}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="AC">Acre</option>
                                        <option value="AL">Alagoas</option>
                                        <option value="AP">Amapá</option>
                                        <option value="AM">Amazonas</option>
                                        <option value="BA">Bahia</option>
                                        <option value="CE">Ceará</option>
                                        <option value="DF">Distrito Federal</option>
                                        <option value="ES">Espírito Santo</option>
                                        <option value="GO">Goiás</option>
                                        <option value="MA">Maranhão</option>
                                        <option value="MT">Mato Grosso</option>
                                        <option value="MS">Mato Grosso do Sul</option>
                                        <option value="MG">Minas Gerais</option>
                                        <option value="PA">Pará</option>
                                        <option value="PB">Paraíba</option>
                                        <option value="PR">Paraná</option>
                                        <option value="PE">Pernambuco</option>
                                        <option value="PI">Piauí</option>
                                        <option value="RJ">Rio de Janeiro</option>
                                        <option value="RN">Rio Grande do Norte</option>
                                        <option value="RS">Rio Grande do Sul</option>
                                        <option value="RO">Rondônia</option>
                                        <option value="RR">Roraima</option>
                                        <option value="SC">Santa Catarina</option>
                                        <option value="SP">São Paulo</option>
                                        <option value="SE">Sergipe</option>
                                        <option value="TO">Tocantins</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Apelido (opcional)</label>
                                    <input 
                                        type="text" 
                                        name="apelido"
                                        value={addressForm.apelido}
                                        onChange={handleAddressChange}
                                        placeholder="Casa, Trabalho..."
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="isPadrao"
                                            checked={addressForm.isPadrao}
                                            onChange={handleAddressChange}
                                        />
                                        <span className="checkmark"></span>
                                        Definir como endereço padrão
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-cancel"
                                onClick={() => {
                                    setShowEditAddressModal(false);
                                    setEditingAddressId(null);
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="btn-save"
                                onClick={handleSaveAddress}
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : 'Atualizar Endereço'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Alterar Senha */}
            {showChangePasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Alterar Senha</h3>
                            <button 
                                className="btn-close"
                                onClick={() => {
                                    setShowChangePasswordModal(false);
                                    setPasswordForm({
                                        senhaAtual: '',
                                        novaSenha: '',
                                        confirmarSenha: ''
                                    });
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Senha Atual *</label>
                                    <input 
                                        type="password" 
                                        name="senhaAtual"
                                        value={passwordForm.senhaAtual}
                                        onChange={handlePasswordChange}
                                        placeholder="Digite sua senha atual"
                                        maxLength="6"
                                        pattern="\d{6}"
                                        title="Deve conter exatamente 6 dígitos numéricos"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nova Senha * (exatamente 6 dígitos)</label>
                                    <input 
                                        type="password" 
                                        name="novaSenha"
                                        value={passwordForm.novaSenha}
                                        onChange={handlePasswordChange}
                                        placeholder="Digite a nova senha"
                                        maxLength="6"
                                        pattern="\d{6}"
                                        title="Deve conter exatamente 6 dígitos numéricos"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirmar Nova Senha *</label>
                                    <input 
                                        type="password" 
                                        name="confirmarSenha"
                                        value={passwordForm.confirmarSenha}
                                        onChange={handlePasswordChange}
                                        placeholder="Confirme a nova senha"
                                        maxLength="6"
                                        pattern="\d{6}"
                                        title="Deve conter exatamente 6 dígitos numéricos"
                                    />
                                </div>
                            </div>
                            <div className="password-tips">
                                <p><strong>Dicas para uma senha segura:</strong></p>
                                <ul>
                                    <li>Use pelo menos 6 caracteres</li>
                                    <li>Combine letras, números e símbolos</li>
                                    <li>Evite informações pessoais</li>
                                    <li>Use uma senha única para esta conta</li>
                                </ul>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-cancel"
                                onClick={() => {
                                    setShowChangePasswordModal(false);
                                    setPasswordForm({
                                        senhaAtual: '',
                                        novaSenha: '',
                                        confirmarSenha: ''
                                    });
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="btn-save"
                                onClick={handleChangePassword}
                                disabled={loading}
                            >
                                {loading ? 'Alterando...' : 'Alterar Senha'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Histórico de Segurança */}
            {showSecurityHistoryModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-large">
                        <div className="modal-header">
                            <h3>Histórico de Segurança</h3>
                            <button 
                                className="btn-close"
                                onClick={() => setShowSecurityHistoryModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            {loading ? (
                                <div className="loading-container">
                                    <p>Carregando histórico...</p>
                                </div>
                            ) : (
                                <div className="security-logs">
                                    {securityLogs.length === 0 ? (
                                        <div className="empty-logs">
                                            <div className="empty-icon">🔐</div>
                                            <h4>Nenhum registro encontrado</h4>
                                            <p>Seu histórico de segurança aparecerá aqui</p>
                                        </div>
                                    ) : (
                                        <div className="logs-list">
                                            {securityLogs.map(log => (
                                                <div key={log.id} className="log-item">
                                                    <div className="log-icon">
                                                        {log.action === 'LOGIN' && '🔑'}
                                                        {log.action === 'LOGOUT' && '🚪'}
                                                        {log.action === 'PASSWORD_CHANGE' && '🔒'}
                                                        {log.action === 'PROFILE_UPDATE' && '👤'}
                                                    </div>
                                                    <div className="log-details">
                                                        <div className="log-header">
                                                            <span className="log-action">{log.actionDisplay}</span>
                                                            <span className={`log-status ${log.status.toLowerCase()}`}>
                                                                {log.statusDisplay}
                                                            </span>
                                                        </div>
                                                        <div className="log-description">{log.description}</div>
                                                        <div className="log-meta">
                                                            <span className="log-date">{log.createdAt}</span>
                                                            {log.ipAddress && (
                                                                <span className="log-ip">IP: {log.ipAddress}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-cancel"
                                onClick={() => setShowSecurityHistoryModal(false)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyAccountPage;
