import React, { useState, useEffect } from 'react';
import { Table, Card, Badge, Spinner, Alert, Row, Col, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import api from '../utils/api';
import UsuarioCadastroModal from './UsuarioCadastroModal';
import UsuarioAlteracaoModal from './UsuarioAlteracaoModal';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loadingUserId, setLoadingUserId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Novos estados
    const [filtroNome, setFiltroNome] = useState('');
    const [showCadastroModal, setShowCadastroModal] = useState(false);
    const [showAlteracaoModal, setShowAlteracaoModal] = useState(false);
    const [usuarioParaAlterar, setUsuarioParaAlterar] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (nomeFilter = '') => {
        try {
            setLoading(true);
            setError('');

            let url = '/usuarios';
            if (nomeFilter.trim()) {
                url = `/usuarios/filtrar?nome=${encodeURIComponent(nomeFilter)}`;
            }

            const response = await api.get(url);
            setUsers(response.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Acesso negado. Apenas administradores podem visualizar usuários.');
            } else if (err.response?.data?.message) {
                setError('Erro ao carregar usuários: ' + err.response.data.message);
            } else {
                setError('Erro ao conectar com o servidor');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleStatusChange = async (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };
    
    const confirmStatusChange = async () => {
        if (!selectedUser) return;
        
        try {
            setLoadingUserId(selectedUser.id);
            const novoStatus = selectedUser.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
            
            await api.put(`/usuarios/${selectedUser.id}/status`, {
                status: novoStatus
            });
            
            // Atualiza a lista de usuários
            setUsers(users.map(user => 
                user.id === selectedUser.id 
                    ? { ...user, status: novoStatus }
                    : user
            ));
            
            setShowModal(false);
            setSelectedUser(null);
            
        } catch (err) {
            console.error('Erro ao alterar status:', err);
            setError('Erro ao alterar status do usuário: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoadingUserId(null);
        }
    };
    
    const cancelStatusChange = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    // Função para filtrar usuários
    // Função para apenas atualizar o valor do filtro (sem aplicar)
    const handleFiltroChange = (e) => {
        const valor = e.target.value;
        setFiltroNome(valor);
    };

    // Função para aplicar o filtro ao clicar no botão de pesquisa
    const aplicarFiltro = () => {
        fetchUsers(filtroNome);
    };

    // Função para aplicar filtro quando pressionar Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            aplicarFiltro();
        }
    };

    // Função para abrir modal de cadastro
    const abrirCadastro = () => {
        setShowCadastroModal(true);
    };

    // Função para abrir modal de alteração
    const abrirAlteracao = (usuario) => {
        setUsuarioParaAlterar(usuario);
        setShowAlteracaoModal(true);
    };

    // Função para limpar filtros
    const limparFiltros = () => {
        setFiltroNome('');
        fetchUsers();
    };

    const getGroupBadge = (grupo) => {
        return grupo === 'ADMIN' ? 
            <Badge bg="danger">{grupo}</Badge> : 
            <Badge bg="info">{grupo}</Badge>;
    };

    const getStatusBadge = (status) => {
        return status === 'ATIVO' ? 
            <Badge bg="success">{status}</Badge> : 
            <Badge bg="secondary">{status}</Badge>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const maskCPF = (cpf) => {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </Spinner>
                <p className="mt-2">Carregando usuários...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Erro!</Alert.Heading>
                <p>{error}</p>
            </Alert>
        );
    }

    return (
        <div>
            <Row className="mb-3">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>👥 Resumo de Usuários</Card.Title>
                            <Row>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-primary">{users.length}</h4>
                                        <small className="text-muted">Total de Usuários</small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-danger">
                                            {users.filter(u => u.grupo === 'ADMIN').length}
                                        </h4>
                                        <small className="text-muted">Administradores</small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-info">
                                            {users.filter(u => u.grupo === 'ESTOQUISTA').length}
                                        </h4>
                                        <small className="text-muted">Estoquistas</small>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-center">
                                        <h4 className="text-success">
                                            {users.filter(u => u.status === 'ATIVO').length}
                                        </h4>
                                        <small className="text-muted">Usuários Ativos</small>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card>
                <Card.Header>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h5 className="mb-0">Lista de Usuários do Sistema</h5>
                        </Col>
                        <Col md={6}>
                            <Row>
                                <Col md={8}>
                                    <InputGroup size="sm">
                                        <Form.Control
                                            type="text"
                                            placeholder="Digite o nome do usuário..."
                                            value={filtroNome}
                                            onChange={handleFiltroChange}
                                            onKeyPress={handleKeyPress}
                                        />
                                        <Button 
                                            variant="primary" 
                                            onClick={aplicarFiltro}
                                            title="Buscar usuários"
                                        >
                                            🔍
                                        </Button>
                                        <Button 
                                            variant="outline-secondary" 
                                            onClick={limparFiltros}
                                            title="Limpar filtros"
                                        >
                                            ✕
                                        </Button>
                                    </InputGroup>
                                </Col>
                                <Col md={4} className="text-end">
                                    <Button 
                                        variant="success" 
                                        size="sm" 
                                        onClick={abrirCadastro}
                                    >
                                        ➕ Cadastrar Usuário
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <div className="table-responsive">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>Email</th>
                                    <th>Grupo</th>
                                    <th>Status</th>
                                    <th>Data Criação</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>
                                            <strong>{user.nome}</strong>
                                        </td>
                                        <td>
                                            <code>{maskCPF(user.cpf)}</code>
                                        </td>
                                        <td>
                                            <span className="text-primary">{user.email}</span>
                                        </td>
                                        <td>{getGroupBadge(user.grupo)}</td>
                                        <td>{getStatusBadge(user.status)}</td>
                                        <td>
                                            <small className="text-muted">
                                                {formatDate(user.createdAt)}
                                            </small>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => abrirAlteracao(user)}
                                                    title="Editar usuário"
                                                    className="me-1"
                                                >
                                                    ✏️ Editar
                                                </Button>
                                                <Button
                                                    variant={user.status === 'ATIVO' ? 'warning' : 'success'}
                                                    size="sm"
                                                    onClick={() => handleStatusChange(user)}
                                                    disabled={loadingUserId === user.id}
                                                    title={user.status === 'ATIVO' ? 'Desativar usuário' : 'Ativar usuário'}
                                                >
                                                    {loadingUserId === user.id ? (
                                                        <Spinner size="sm" animation="border" />
                                                    ) : (
                                                        <>
                                                            {user.status === 'ATIVO' ? (
                                                                <>🔒 Desativar</>
                                                            ) : (
                                                                <>🔓 Ativar</>
                                                            )}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            <Alert variant="info" className="mt-3">
                <Alert.Heading>ℹ️ Informação</Alert.Heading>
                <p>
                    Esta funcionalidade está disponível apenas para usuários com perfil de <strong>ADMINISTRADOR</strong>.
                    Usuários com perfil de <strong>ESTOQUISTA</strong> não têm acesso a esta lista.
                </p>
                <p className="mb-0">
                    <strong>Ações disponíveis:</strong> Você pode cadastrar novos usuários, editar informações, 
                    filtrar a lista por nome e ativar/desativar usuários conforme necessário.
                    Usuários inativos não poderão fazer login no sistema.
                </p>
            </Alert>
            
            {/* Modal de Confirmação */}
            <Modal show={showModal} onHide={cancelStatusChange} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedUser?.status === 'ATIVO' ? '🔒 Desativar Usuário' : '🔓 Ativar Usuário'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <div>
                            <p>
                                Tem certeza que deseja {selectedUser.status === 'ATIVO' ? 'desativar' : 'ativar'} o usuário:
                            </p>
                            <div className="bg-light p-3 rounded">
                                <strong>{selectedUser.nome}</strong><br/>
                                <small className="text-muted">{selectedUser.email}</small><br/>
                                <Badge bg={selectedUser.grupo === 'ADMIN' ? 'danger' : 'info'}>
                                    {selectedUser.grupo}
                                </Badge>
                            </div>
                            <br/>
                            <Alert variant={selectedUser.status === 'ATIVO' ? 'warning' : 'info'}>
                                {selectedUser.status === 'ATIVO' ? (
                                    <>
                                        <strong>⚠️ Atenção:</strong> Ao desativar este usuário, ele não conseguirá mais 
                                        fazer login no sistema até ser reativado.
                                    </>
                                ) : (
                                    <>
                                        <strong>ℹ️ Informação:</strong> Ao ativar este usuário, ele poderá fazer login 
                                        normalmente no sistema.
                                    </>
                                )}
                            </Alert>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelStatusChange}>
                        Cancelar
                    </Button>
                    <Button 
                        variant={selectedUser?.status === 'ATIVO' ? 'warning' : 'success'}
                        onClick={confirmStatusChange}
                        disabled={loadingUserId !== null}
                    >
                        {loadingUserId !== null ? (
                            <Spinner size="sm" animation="border" className="me-2" />
                        ) : null}
                        {selectedUser?.status === 'ATIVO' ? 'Sim, Desativar' : 'Sim, Ativar'}
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Modal de Cadastro */}
            <UsuarioCadastroModal
                show={showCadastroModal}
                onHide={() => setShowCadastroModal(false)}
                onUsuarioCadastrado={() => {
                    fetchUsers();
                    setShowCadastroModal(false);
                }}
            />
            
            {/* Modal de Alteração */}
            <UsuarioAlteracaoModal
                show={showAlteracaoModal}
                onHide={() => {
                    setShowAlteracaoModal(false);
                    setUsuarioParaAlterar(null);
                }}
                usuario={usuarioParaAlterar}
                onUsuarioAlterado={() => {
                    fetchUsers();
                    setShowAlteracaoModal(false);
                    setUsuarioParaAlterar(null);
                }}
            />
        </div>
    );
};

export default UserList;
