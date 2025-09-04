import React, { useState, useEffect } from 'react';
import { Table, Card, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import api from '../utils/api';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const response = await api.get('/usuarios');
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
                    <h5 className="mb-0">Lista de Usuários do Sistema</h5>
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
            </Alert>
        </div>
    );
};

export default UserList;
