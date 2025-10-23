import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EcommerceHeader from './EcommerceHeader';
import { useAuth } from '../hooks/useAuth';
import { Modal, Button } from 'react-bootstrap';
import api from '../utils/api';
import './AuthPage.css';

const AuthPage = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('login'); // 'login' ou 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    // Estados para gerenciar endereços dentro do modal de edição
    const [enderecosSalvos, setEnderecosSalvos] = useState([]);
    const [showAddEnderecoModal, setShowAddEnderecoModal] = useState(false);
    const [enderecoEditando, setEnderecoEditando] = useState(null);
    const [enderecoForm, setEnderecoForm] = useState({
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
        genero: '',
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

        // Validar nome - deve ter no mínimo duas palavras com pelo menos 3 letras cada
        const nomePartes = registerData.nome.trim().split(/\s+/);
        if (nomePartes.length < 2) {
            setError('Nome completo deve ter pelo menos nome e sobrenome');
            setLoading(false);
            return;
        }
        
        const palavrasInvalidas = nomePartes.filter(palavra => palavra.length < 3);
        if (palavrasInvalidas.length > 0) {
            setError('Cada palavra do nome deve ter pelo menos 3 letras');
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
                genero: registerData.genero || null,
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
                    genero: '',
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

    const handleOpenLogoutModal = () => {
        setShowLogoutModal(true);
    };

    const handleLogout = (clearCache = false) => {
        if (clearCache) {
            // Limpar todo o cache do navegador relacionado ao login
            localStorage.clear();
            sessionStorage.clear();
            
            // Limpar cookies se houver
            document.cookie.split(";").forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            logout();
            setSuccess('Logout realizado e cache limpo com sucesso!');
        } else {
            // Apenas fazer logout (mantém cache do carrinho e outras preferências)
        logout();
        setSuccess('Logout realizado com sucesso!');
        }
        
        setShowLogoutModal(false);
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

    // Funções para editar perfil
    const handleOpenEditModal = () => {
        setEditData({
            nome: user.nome || '',
            email: user.email || '',
            telefone: user.telefone || '',
            dataNascimento: user.dataNascimento || '',
            genero: user.genero || '',
            cep: user.cep || '',
            logradouro: user.logradouro || '',
            numero: user.numero || '',
            complemento: user.complemento || '',
            bairro: user.bairro || '',
            cidade: user.cidade || '',
            uf: user.uf || '',
            senhaAtual: '',
            novaSenha: '',
            confirmarNovaSenha: ''
        });
        setShowEditModal(true);
        setError('');
        setSuccess('');
        carregarEnderecos(); // Carregar endereços ao abrir modal
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData({
            ...editData,
            [name]: value
        });
    };

    const buscarCEPEdit = async (cep) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await response.json();
                
                if (!data.erro) {
                    setEditData({
                        ...editData,
                        cep: cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2'),
                        logradouro: data.logradouro,
                        bairro: data.bairro,
                        cidade: data.localidade,
                        uf: data.uf
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validar nome - deve ter no mínimo duas palavras com pelo menos 3 letras cada
        const nomePartes = editData.nome.trim().split(/\s+/);
        if (nomePartes.length < 2) {
            setError('Nome completo deve ter pelo menos nome e sobrenome');
            setLoading(false);
            return;
        }
        
        const palavrasInvalidas = nomePartes.filter(palavra => palavra.length < 3);
        if (palavrasInvalidas.length > 0) {
            setError('Cada palavra do nome deve ter pelo menos 3 letras');
            setLoading(false);
            return;
        }

        // Validar alteração de senha se foi preenchida
        if (editData.novaSenha || editData.confirmarNovaSenha || editData.senhaAtual) {
            if (!editData.senhaAtual) {
                setError('Digite sua senha atual para alterar a senha');
                setLoading(false);
                return;
            }
            if (!editData.novaSenha) {
                setError('Digite a nova senha');
                setLoading(false);
                return;
            }
            if (editData.novaSenha.length < 6) {
                setError('A nova senha deve ter pelo menos 6 caracteres');
                setLoading(false);
                return;
            }
            if (editData.novaSenha !== editData.confirmarNovaSenha) {
                setError('As senhas não coincidem');
                setLoading(false);
                return;
            }
        }

        try {
            // Formatar data para yyyy-MM-dd se necessário
            let dataFormatada = editData.dataNascimento;
            
            // Se já está no formato yyyy-MM-dd, manter como está
            // Se está no formato dd/MM/yyyy, converter
            if (dataFormatada && dataFormatada.includes('/')) {
                const [dia, mes, ano] = dataFormatada.split('/');
                dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            }

            const payload = {
                nome: editData.nome,
                email: editData.email,
                telefone: editData.telefone.replace(/\D/g, ''),
                dataNascimento: dataFormatada,
                genero: editData.genero || null,
                cep: editData.cep.replace(/\D/g, ''),
                logradouro: editData.logradouro,
                numero: editData.numero,
                complemento: editData.complemento,
                bairro: editData.bairro,
                cidade: editData.cidade,
                uf: editData.uf
            };

            // Se houver alteração de senha, adicionar ao payload
            if (editData.novaSenha) {
                payload.senhaAtual = editData.senhaAtual;
                payload.novaSenha = editData.novaSenha;
            }

            const response = await api.put(`/clientes/${user.id}`, payload);
            
            if (response.data && response.data.data) {
                // Atualizar dados do usuário no contexto e localStorage
                const updatedUser = {
                    ...user,
                    ...response.data.data
                };
                
                console.log('Dados atualizados:', updatedUser);
                
                // Atualizar contexto
                updateUser(updatedUser);
                
                // Também atualizar diretamente no localStorage para garantir
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                setSuccess('Dados atualizados com sucesso!');
                setShowEditModal(false);
                
                // Forçar atualização da página após um pequeno delay
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (err) {
            console.error('Erro ao atualizar dados:', err);
            setError(err.response?.data?.message || 'Erro ao atualizar dados');
        } finally {
            setLoading(false);
        }
    };

    // Formatar CPF para exibição
    const formatCPF = (cpf) => {
        if (!cpf) return 'Não informado';
        const numbers = cpf.replace(/\D/g, '');
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    // Formatar telefone para exibição
    const formatPhone = (phone) => {
        if (!phone) return 'Não informado';
        const numbers = phone.replace(/\D/g, '');
        if (numbers.length === 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (numbers.length === 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    };

    // Formatar data para exibição
    const formatDate = (date) => {
        if (!date) return 'Não informada';
        
        // Se a data está no formato yyyy-MM-dd, fazer parse manual para evitar problema de fuso horário
        if (typeof date === 'string' && date.includes('-')) {
            const [year, month, day] = date.split('-');
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        }
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Não informada';
        return d.toLocaleDateString('pt-BR');
    };
    
    // ===== FUNÇÕES DE GERENCIAMENTO DE ENDEREÇOS =====
    
    const carregarEnderecos = async () => {
        try {
            const response = await api.get('/cliente/enderecos');
            if (response.data.success) {
                setEnderecosSalvos(response.data.enderecos || []);
            }
        } catch (err) {
            console.error('Erro ao carregar endereços:', err);
            setError('Erro ao carregar endereços');
        }
    };
    
    const handleAbrirAdicionarEndereco = () => {
        setEnderecoForm({
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            apelido: '',
            isPadrao: enderecosSalvos.length === 0
        });
        setEnderecoEditando(null);
        setShowAddEnderecoModal(true);
        setError('');
    };
    
    const handleEditarEndereco = (endereco) => {
        setEnderecoForm({
            cep: endereco.cep || '',
            logradouro: endereco.logradouro || '',
            numero: endereco.numero || '',
            complemento: endereco.complemento || '',
            bairro: endereco.bairro || '',
            cidade: endereco.cidade || '',
            estado: endereco.estado || '',
            apelido: endereco.apelido || '',
            isPadrao: endereco.isPadrao || false
        });
        setEnderecoEditando(endereco);
        setShowAddEnderecoModal(true);
        setError('');
    };
    
    const handleEnderecoFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;
        
        if (name === 'estado') {
            finalValue = value.toUpperCase().substring(0, 2);
        }
        
        setEnderecoForm(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };
    
    const buscarCEPEndereco = async (cep) => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setEnderecoForm(prev => ({
                    ...prev,
                    logradouro: data.logradouro || '',
                    bairro: data.bairro || '',
                    cidade: data.localidade || '',
                    estado: data.uf || ''
                }));
            }
        } catch (err) {
            console.error('Erro ao buscar CEP:', err);
        }
    };
    
    const handleCepEnderecoChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.substring(0, 8);
        const formatted = value.replace(/(\d{5})(\d{3})/, '$1-$2');
        
        setEnderecoForm(prev => ({ ...prev, cep: formatted }));

        if (value.length === 8) {
            buscarCEPEndereco(value);
        }
    };
    
    const handleSalvarEndereco = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validações
        if (!enderecoForm.cep || enderecoForm.cep.replace(/\D/g, '').length !== 8) {
            setError('CEP inválido. Deve conter 8 dígitos.');
            setLoading(false);
            return;
        }

        if (!enderecoForm.estado || enderecoForm.estado.length !== 2) {
            setError('Estado (UF) é obrigatório e deve ter 2 caracteres.');
            setLoading(false);
            return;
        }

        if (!enderecoForm.logradouro || !enderecoForm.numero || !enderecoForm.bairro || !enderecoForm.cidade) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                cep: enderecoForm.cep.replace(/\D/g, ''),
                logradouro: enderecoForm.logradouro.trim(),
                numero: enderecoForm.numero.trim(),
                complemento: enderecoForm.complemento?.trim() || '',
                bairro: enderecoForm.bairro.trim(),
                cidade: enderecoForm.cidade.trim(),
                estado: enderecoForm.estado.toUpperCase().trim(),
                apelido: enderecoForm.apelido?.trim() || '',
                isPadrao: enderecoForm.isPadrao || false
            };

            console.log('Payload enviado:', payload);

            let response;
            if (enderecoEditando) {
                console.log('Editando endereço ID:', enderecoEditando.id);
                response = await api.put(`/cliente/enderecos/${enderecoEditando.id}`, payload);
            } else {
                console.log('Criando novo endereço');
                response = await api.post('/cliente/enderecos', payload);
            }

            console.log('Resposta do servidor:', response.data);

            if (response.data.success) {
                setSuccess(response.data.message);
                await carregarEnderecos();
                setShowAddEnderecoModal(false);
            }
        } catch (err) {
            console.error('Erro ao salvar endereço:', err);
            console.error('Erro detalhado:', err.response?.data);
            setError(err.response?.data?.message || 'Erro ao salvar endereço');
        } finally {
            setLoading(false);
        }
    };
    
    const handleDefinirPadrao = async (enderecoId) => {
        try {
            setLoading(true);
            const response = await api.patch(`/cliente/enderecos/${enderecoId}/padrao`);
            
            if (response.data.success) {
                setSuccess('Endereço definido como padrão');
                await carregarEnderecos();
            }
        } catch (err) {
            console.error('Erro ao definir endereço padrão:', err);
            setError(err.response?.data?.message || 'Erro ao definir endereço padrão');
        } finally {
            setLoading(false);
        }
    };
    
    const handleRemoverEndereco = async (enderecoId) => {
        if (!window.confirm('Tem certeza que deseja remover este endereço?')) {
            return;
        }
        
        try {
            setLoading(true);
            const response = await api.delete(`/cliente/enderecos/${enderecoId}`);
            
            if (response.data.success) {
                setSuccess('Endereço removido com sucesso');
                await carregarEnderecos();
            }
        } catch (err) {
            console.error('Erro ao remover endereço:', err);
            setError(err.response?.data?.message || 'Erro ao remover endereço');
        } finally {
            setLoading(false);
        }
    };

    // Carregar endereços ao exibir perfil
    useEffect(() => {
        if (user) {
            carregarEnderecos();
        }
    }, [user]);

    // Se usuário já está logado, mostrar interface com dados do perfil
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
                    <div className="auth-card logged-in-card" style={{ maxWidth: '700px' }}>
                        <div className="user-info">
                            <div className="user-avatar" style={{ marginBottom: '20px' }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #FF4F5A, #FF8E95)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '48px',
                                    fontWeight: 'bold',
                                    margin: '0 auto',
                                    boxShadow: '0 4px 15px rgba(255, 79, 90, 0.3)'
                                }}>
                                    {user.nome?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </div>
                            
                            <h2 style={{ marginBottom: '8px', marginTop: '0' }}>
                                Olá, {user.nome}!
                            </h2>
                            <p className="user-type" style={{ marginBottom: '30px' }}>
                                {user.tipo === 'CLIENTE' ? '👤 Cliente' :
                                 user.grupo === 'CLIENTE' ? '👤 Cliente' :
                                 user.tipo === 'ADMIN' || user.grupo === 'ADMIN' ? '👑 Administrador' : 
                                 '📦 Estoquista'}
                            </p>

                            {/* Informações Pessoais */}
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                borderRadius: '12px',
                                padding: '24px',
                                marginBottom: '20px',
                                textAlign: 'left'
                            }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1e293b',
                                    marginBottom: '16px',
                                    borderBottom: '2px solid #FF4F5A',
                                    paddingBottom: '8px'
                                }}>
                                    📋 Informações Pessoais
                                </h3>
                                
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Nome Completo:</span>
                                        <span style={{ color: '#1e293b', fontWeight: '600', textAlign: 'right' }}>{user.nome || 'Não informado'}</span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Email:</span>
                                        <span style={{ color: '#1e293b', fontWeight: '600', textAlign: 'right' }}>{user.email || 'Não informado'}</span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>CPF:</span>
                                        <span style={{ color: '#1e293b', fontWeight: '600' }}>{formatCPF(user.cpf)}</span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Telefone:</span>
                                        <span style={{ color: '#1e293b', fontWeight: '600' }}>{formatPhone(user.telefone)}</span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Data de Nascimento:</span>
                                        <span style={{ color: '#1e293b', fontWeight: '600' }}>{formatDate(user.dataNascimento)}</span>
                                    </div>
                                    
                                    {user.genero && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                            <span style={{ color: '#64748b', fontWeight: '500' }}>Gênero:</span>
                                            <span style={{ color: '#1e293b', fontWeight: '600' }}>
                                                {user.genero === 'MASCULINO' ? 'Masculino' :
                                                 user.genero === 'FEMININO' ? 'Feminino' :
                                                 user.genero === 'OUTRO' ? 'Outro' :
                                                 user.genero === 'NAO_INFORMADO' ? 'Não informado' :
                                                 'Não informado'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Endereço de Faturamento */}
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                borderRadius: '12px',
                                padding: '24px',
                                marginBottom: '20px',
                                textAlign: 'left'
                            }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1e293b',
                                    marginBottom: '16px',
                                    borderBottom: '2px solid #FF4F5A',
                                    paddingBottom: '8px'
                                }}>
                                    � Endereço de Faturamento
                                </h3>
                                
                                <div style={{ display: 'grid', gap: '8px', color: '#1e293b' }}>
                                    <p style={{ margin: 0 }}>
                                        <strong>CEP:</strong> {user.endereco?.cep || user.cep || 'Não informado'}
                                    </p>
                                    <p style={{ margin: 0 }}>
                                        <strong>Logradouro:</strong> {user.endereco?.logradouro || user.logradouro || 'Não informado'}, {user.endereco?.numero || user.numero || 'S/N'}
                                    </p>
                                    {(user.endereco?.complemento || user.complemento) && (
                                        <p style={{ margin: 0 }}>
                                            <strong>Complemento:</strong> {user.endereco?.complemento || user.complemento}
                                        </p>
                                    )}
                                    <p style={{ margin: 0 }}>
                                        <strong>Bairro:</strong> {user.endereco?.bairro || user.bairro || 'Não informado'}
                                    </p>
                                    <p style={{ margin: 0 }}>
                                        <strong>Cidade/UF:</strong> {user.endereco?.cidade || user.cidade || 'Não informado'} - {user.endereco?.uf || user.uf || ''}
                                    </p>
                                </div>
                            </div>

                            {/* Endereços de Entrega */}
                            {enderecosSalvos.length > 0 && (
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    marginBottom: '20px',
                                    textAlign: 'left'
                                }}>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        marginBottom: '16px',
                                        borderBottom: '2px solid #FF4F5A',
                                        paddingBottom: '8px'
                                    }}>
                                        📦 Endereços de Entrega
                                    </h3>
                                    
                                    <div className="row">
                                        {enderecosSalvos.map((endereco, index) => (
                                            <div key={endereco.id} className="col-md-6 mb-3">
                                                <div className={`card ${endereco.isPadrao ? 'border-primary' : 'border-secondary'}`} style={{ height: '100%' }}>
                                                    <div className="card-body">
                                                        {endereco.isPadrao && (
                                                            <span className="badge bg-primary mb-2">⭐ Padrão</span>
                                                        )}
                                                        {endereco.apelido && (
                                                            <h6 className="card-title" style={{ fontWeight: '600', color: '#1e293b' }}>
                                                                {endereco.apelido}
                                                            </h6>
                                                        )}
                                                        <p className="card-text mb-1" style={{ fontSize: '14px' }}>
                                                            <strong>Endereço:</strong> {endereco.logradouro}, {endereco.numero}
                                                            {endereco.complemento && ` - ${endereco.complemento}`}
                                                        </p>
                                                        <p className="card-text mb-1" style={{ fontSize: '14px' }}>
                                                            <strong>Bairro:</strong> {endereco.bairro}
                                                        </p>
                                                        <p className="card-text mb-1" style={{ fontSize: '14px' }}>
                                                            <strong>Cidade:</strong> {endereco.cidade} - {endereco.estado}
                                                        </p>
                                                        <p className="card-text mb-0" style={{ fontSize: '14px' }}>
                                                            <strong>CEP:</strong> {endereco.cep}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {success && <div className="success-message">{success}</div>}
                            {error && <div className="alert alert-error" style={{ marginTop: '20px' }}>{error}</div>}
                            
                            <div className="logout-actions" style={{ gap: '12px', marginTop: '24px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button 
                                    className="btn-secondary btn-large"
                                    onClick={handleOpenEditModal}
                                    style={{ minWidth: '200px' }}
                                >
                                    ✏️ Editar Dados
                                </button>
                                <button 
                                    className="btn-primary btn-large logout-btn"
                                    onClick={handleOpenLogoutModal}
                                    disabled={loading}
                                    style={{ minWidth: '200px' }}
                                >
                                    🚪 Sair da Conta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                {/* Modal de Edição */}
                <Modal 
                    show={showEditModal} 
                    onHide={() => setShowEditModal(false)} 
                    size="lg" 
                    centered
                    backdrop="static"
                    className="modal-with-backdrop"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Editar Meus Dados</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSaveEdit}>
                            {error && <div className="alert alert-error">{error}</div>}
                            
                            <div className="row">
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Nome Completo *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nome"
                                        value={editData.nome || ''}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={editData.email || ''}
                                        onChange={handleEditChange}
                                        required
                                        disabled
                                        title="O email não pode ser alterado"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Telefone *</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="telefone"
                                        value={editData.telefone || ''}
                                        onChange={handleEditChange}
                                        placeholder="(00) 00000-0000"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Data de Nascimento *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="dataNascimento"
                                        value={editData.dataNascimento || ''}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Gênero</label>
                                    <select
                                        className="form-control"
                                        name="genero"
                                        value={editData.genero || ''}
                                        onChange={handleEditChange}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="MASCULINO">Masculino</option>
                                        <option value="FEMININO">Feminino</option>
                                        <option value="OUTRO">Outro</option>
                                        <option value="NAO_INFORMADO">Prefiro não informar</option>
                                    </select>
                                </div>
                            </div>

                            <hr />
                            <h5>Alterar Senha</h5>
                            <p className="text-muted small">Deixe em branco se não deseja alterar a senha</p>

                            <div className="row">
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Senha Atual</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="senhaAtual"
                                        value={editData.senhaAtual || ''}
                                        onChange={handleEditChange}
                                        placeholder="Digite sua senha atual"
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Nova Senha</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="novaSenha"
                                        value={editData.novaSenha || ''}
                                        onChange={handleEditChange}
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Confirmar Nova Senha</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="confirmarNovaSenha"
                                        value={editData.confirmarNovaSenha || ''}
                                        onChange={handleEditChange}
                                        placeholder="Confirme a nova senha"
                                    />
                                </div>
                            </div>

                            <hr />
                            <h5>Endereço de Faturamento</h5>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">CEP *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="cep"
                                        value={editData.cep || ''}
                                        onChange={(e) => {
                                            handleEditChange(e);
                                            const cep = e.target.value.replace(/\D/g, '');
                                            if (cep.length === 8) {
                                                buscarCEPEdit(cep);
                                            }
                                        }}
                                        placeholder="00000-000"
                                        required
                                    />
                                </div>
                                <div className="col-md-8 mb-3">
                                    <label className="form-label">Logradouro *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="logradouro"
                                        value={editData.logradouro || ''}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Número *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="numero"
                                        value={editData.numero || ''}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-9 mb-3">
                                    <label className="form-label">Complemento</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="complemento"
                                        value={editData.complemento || ''}
                                        onChange={handleEditChange}
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Bairro *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="bairro"
                                        value={editData.bairro || ''}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Cidade *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="cidade"
                                        value={editData.cidade || ''}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-2 mb-3">
                                    <label className="form-label">UF *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="uf"
                                        value={editData.uf || ''}
                                        onChange={handleEditChange}
                                        maxLength="2"
                                        required
                                    />
                                </div>
                            </div>

                            <hr />
                            <h5>Endereços de Entrega</h5>
                            <p className="text-muted small">Gerencie seus endereços de entrega. Você pode adicionar novos e definir qual é o padrão.</p>
                            
                            <div className="mb-3">
                                <Button 
                                    variant="success" 
                                    size="sm"
                                    onClick={handleAbrirAdicionarEndereco}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Adicionar Novo Endereço
                                </Button>
                            </div>

                            {enderecosSalvos.length === 0 ? (
                                <div className="alert alert-info">
                                    <i className="bi bi-info-circle"></i> Nenhum endereço de entrega cadastrado.
                                </div>
                            ) : (
                                <div className="row">
                                    {enderecosSalvos.map((endereco) => (
                                        <div key={endereco.id} className="col-md-6 mb-3">
                                            <div className={`card ${endereco.isPadrao ? 'border-primary' : 'border-secondary'}`}>
                                                <div className="card-body">
                                                    {endereco.isPadrao && (
                                                        <span className="badge bg-primary mb-2">⭐ Padrão</span>
                                                    )}
                                                    {endereco.apelido && (
                                                        <h6 className="card-title">{endereco.apelido}</h6>
                                                    )}
                                                    <p className="card-text mb-1">
                                                        <small>
                                                            {endereco.logradouro}, {endereco.numero}
                                                            {endereco.complemento && ` - ${endereco.complemento}`}
                                                        </small>
                                                    </p>
                                                    <p className="card-text mb-1">
                                                        <small>{endereco.bairro}</small>
                                                    </p>
                                                    <p className="card-text mb-1">
                                                        <small>{endereco.cidade} - {endereco.estado}</small>
                                                    </p>
                                                    <p className="card-text mb-2">
                                                        <small>CEP: {endereco.cep}</small>
                                                    </p>
                                                    
                                                    {!endereco.isPadrao && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary w-100"
                                                            onClick={() => handleDefinirPadrao(endereco.id)}
                                                        >
                                                            <i className="bi bi-star"></i> Definir como Padrão
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleSaveEdit} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal de Adicionar Endereço de Entrega */}
                <Modal 
                    show={showAddEnderecoModal} 
                    onHide={() => setShowAddEnderecoModal(false)}
                    centered
                    backdrop="static"
                    className="modal-with-backdrop"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Adicionar Endereço de Entrega</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        
                        <form onSubmit={handleSalvarEndereco}>
                            <div className="mb-3">
                                <label className="form-label">Apelido (ex: Casa, Trabalho)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="apelido"
                                    value={enderecoForm.apelido}
                                    onChange={handleEnderecoFormChange}
                                    placeholder="Casa, Trabalho, etc."
                                />
                                <small className="text-muted">Opcional: dê um nome para identificar este endereço</small>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">CEP *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="cep"
                                        value={enderecoForm.cep}
                                        onChange={handleCepEnderecoChange}
                                        placeholder="00000-000"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Logradouro *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="logradouro"
                                    value={enderecoForm.logradouro}
                                    onChange={handleEnderecoFormChange}
                                    required
                                />
                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Número *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="numero"
                                        value={enderecoForm.numero}
                                        onChange={handleEnderecoFormChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-8 mb-3">
                                    <label className="form-label">Complemento</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="complemento"
                                        value={enderecoForm.complemento}
                                        onChange={handleEnderecoFormChange}
                                        placeholder="Apto, Bloco, etc."
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Bairro *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="bairro"
                                        value={enderecoForm.bairro}
                                        onChange={handleEnderecoFormChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Cidade *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="cidade"
                                        value={enderecoForm.cidade}
                                        onChange={handleEnderecoFormChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-2 mb-3">
                                    <label className="form-label">UF *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="estado"
                                        value={enderecoForm.estado}
                                        onChange={handleEnderecoFormChange}
                                        maxLength="2"
                                        required
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>
                            </div>

                            <div className="form-check mb-3">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="isPadraoCheck"
                                    name="isPadrao"
                                    checked={enderecoForm.isPadrao}
                                    onChange={handleEnderecoFormChange}
                                    disabled={enderecosSalvos.length === 0}
                                />
                                <label className="form-check-label" htmlFor="isPadraoCheck">
                                    Definir como endereço padrão
                                </label>
                                {enderecosSalvos.length === 0 && (
                                    <small className="text-muted d-block">Este será seu primeiro endereço e será definido como padrão automaticamente</small>
                                )}
                            </div>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddEnderecoModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleSalvarEndereco} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Endereço'}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal de Logout */}
                <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Deseja sair da conta?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{ padding: '10px 0' }}>
                            <p style={{ fontSize: '16px', marginBottom: '20px', color: '#475569' }}>
                                Escolha como deseja sair:
                            </p>
                            
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '15px',
                                border: '2px solid #e2e8f0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '24px' }}>🚪</span>
                                    <h5 style={{ margin: 0, color: '#1e293b' }}>Sair Mantendo Cache</h5>
                                </div>
                                <p style={{ margin: '8px 0', fontSize: '14px', color: '#64748b' }}>
                                    Seus dados de login ficarão salvos para facilitar o próximo acesso.
                                    O carrinho de compras será mantido.
                                </p>
                                <Button 
                                    variant="outline-primary" 
                                    onClick={() => handleLogout(false)}
                                    style={{ width: '100%', marginTop: '10px' }}
                                >
                                    Sair e Manter Dados
                                </Button>
                            </div>

                            <div style={{
                                backgroundColor: '#fff5f5',
                                borderRadius: '12px',
                                padding: '20px',
                                border: '2px solid #fecaca'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '24px' }}>🗑️</span>
                                    <h5 style={{ margin: 0, color: '#dc2626' }}>Limpar Cache e Sair</h5>
                        </div>
                                <p style={{ margin: '8px 0', fontSize: '14px', color: '#991b1b' }}>
                                    Remove todos os dados salvos no navegador, incluindo carrinho,
                                    preferências e histórico de navegação.
                                </p>
                                <Button 
                                    variant="danger" 
                                    onClick={() => handleLogout(true)}
                                    style={{ width: '100%', marginTop: '10px' }}
                                >
                                    Limpar Tudo e Sair
                                </Button>
                    </div>
                </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
                            Cancelar
                        </Button>
                    </Modal.Footer>
                </Modal>
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

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="register-genero">Gênero</label>
                                    <select
                                        id="register-genero"
                                        name="genero"
                                        value={registerData.genero}
                                        onChange={handleRegisterChange}
                                        className="form-control"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="MASCULINO">Masculino</option>
                                        <option value="FEMININO">Feminino</option>
                                        <option value="OUTRO">Outro</option>
                                        <option value="NAO_INFORMADO">Prefiro não informar</option>
                                    </select>
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
                                <h3>Endereço de Faturamento</h3>
                                
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
