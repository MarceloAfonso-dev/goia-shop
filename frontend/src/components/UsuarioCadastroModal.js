import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api from '../utils/api';
import { hashPassword } from '../utils/crypto';

const UsuarioCadastroModal = ({ show, onHide, onUsuarioCadastrado }) => {
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        email: '',
        senha: '',
        confirmaSenha: '',
        grupo: 'ESTOQUISTA'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const validarCPF = (cpf) => {
        const cpfLimpo = cpf.replace(/\D/g, '');
        return cpfLimpo.length === 11 && /^\d{11}$/.test(cpfLimpo);
    };

    const validarEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validações frontend
            if (!formData.nome.trim()) {
                throw new Error('Nome é obrigatório');
            }
            if (!validarCPF(formData.cpf)) {
                throw new Error('CPF deve conter exatamente 11 dígitos');
            }
            if (!validarEmail(formData.email)) {
                throw new Error('Email deve ter formato válido');
            }
            if (formData.senha.length < 6) {
                throw new Error('Senha deve ter no mínimo 6 caracteres');
            }
            if (formData.senha !== formData.confirmaSenha) {
                throw new Error('As senhas não coincidem');
            }

            // Criptografar senha antes de enviar
            const senhaEncriptada = await hashPassword(formData.senha);

            const dadosEnvio = {
                ...formData,
                cpf: formData.cpf.replace(/\D/g, ''), // Remove formatação
                senha: senhaEncriptada,
                confirmaSenha: senhaEncriptada
            };

            await api.post('/usuarios/cadastrar', dadosEnvio);
            
            setSuccess('Usuário cadastrado com sucesso!');
            
            // Resetar formulário
            setFormData({
                nome: '',
                cpf: '',
                email: '',
                senha: '',
                confirmaSenha: '',
                grupo: 'ESTOQUISTA'
            });

            // Aguardar um pouco antes de fechar
            setTimeout(() => {
                onUsuarioCadastrado();
                onHide();
                setSuccess('');
            }, 2000);

        } catch (err) {
            if (err.response?.data) {
                setError(err.response.data);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCPF = (value) => {
        const cpf = value.replace(/\D/g, '');
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const handleCPFChange = (e) => {
        const value = e.target.value;
        const cpfFormatado = formatCPF(value);
        setFormData(prev => ({
            ...prev,
            cpf: cpfFormatado
        }));
        setError('');
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>➕ Cadastrar Novo Usuário</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Nome completo do usuário"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>CPF *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cpf"
                                    value={formData.cpf}
                                    onChange={handleCPFChange}
                                    required
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="email@exemplo.com"
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Senha *</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="senha"
                                    value={formData.senha}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Confirmar Senha *</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="confirmaSenha"
                                    value={formData.confirmaSenha}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Repita a senha"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Grupo *</Form.Label>
                        <Form.Select
                            name="grupo"
                            value={formData.grupo}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="ESTOQUISTA">Estoquista</option>
                            <option value="ADMIN">Administrador</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Escolha o nível de acesso do usuário no sistema
                        </Form.Text>
                    </Form.Group>

                    <Alert variant="info" className="small">
                        <strong>ℹ️ Informações:</strong>
                        <ul className="mb-0 mt-2">
                            <li>O usuário será criado com status <strong>ATIVO</strong></li>
                            <li>A senha será criptografada com segurança SHA-256 + BCrypt</li>
                            <li>Não é possível cadastrar CPF ou email já existente</li>
                        </ul>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="success" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Cadastrando...
                            </>
                        ) : (
                            '💾 Cadastrar Usuário'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UsuarioCadastroModal;
