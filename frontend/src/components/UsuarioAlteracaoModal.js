import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api from '../utils/api';

const UsuarioAlteracaoModal = ({ show, onHide, usuario, onUsuarioAlterado }) => {
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        senha: '',
        confirmaSenha: '',
        grupo: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Preenche o formulário quando o usuário é carregado
    useEffect(() => {
        if (usuario) {
            setFormData({
                nome: usuario.nome || '',
                cpf: formatCPF(usuario.cpf || ''),
                senha: '',
                confirmaSenha: '',
                grupo: usuario.grupo || ''
            });
        }
    }, [usuario]);

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

    const formatCPF = (value) => {
        if (!value) return '';
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
            
            // Validar senha apenas se foi fornecida
            if (formData.senha && formData.senha.length < 6) {
                throw new Error('Senha deve ter no mínimo 6 caracteres');
            }
            if (formData.senha && formData.senha !== formData.confirmaSenha) {
                throw new Error('As senhas não coincidem');
            }

            // Preparar dados para envio
            const dadosEnvio = {
                nome: formData.nome,
                cpf: formData.cpf.replace(/\D/g, ''), // Remove formatação
                grupo: formData.grupo
            };

            // Incluir senha apenas se foi alterada
            if (formData.senha) {
                // Enviar senha original para o backend (sem criptografia no frontend)
                // O backend será responsável por toda a criptografia (BCrypt)
                dadosEnvio.senha = formData.senha;
                dadosEnvio.confirmaSenha = formData.confirmaSenha;
            }

            await api.put(`/usuarios/${usuario.id}/alterar`, dadosEnvio);
            
            setSuccess('Usuário alterado com sucesso!');

            // Aguardar um pouco antes de fechar
            setTimeout(() => {
                onUsuarioAlterado();
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

    if (!usuario) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>✏️ Alterar Usuário</Modal.Title>
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
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={usuario.email}
                            disabled
                            className="bg-light"
                        />
                        <Form.Text className="text-muted">
                            ⚠️ O email não pode ser alterado após o cadastro
                        </Form.Text>
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nova Senha</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="senha"
                                    value={formData.senha}
                                    onChange={handleInputChange}
                                    placeholder="Deixe em branco para manter a atual"
                                    minLength={6}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Confirmar Nova Senha</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="confirmaSenha"
                                    value={formData.confirmaSenha}
                                    onChange={handleInputChange}
                                    placeholder="Confirme a nova senha"
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

                    <Alert variant="warning" className="small">
                        <strong>⚠️ Atenções:</strong>
                        <ul className="mb-0 mt-2">
                            <li>O email <strong>não pode</strong> ser alterado</li>
                            <li>Deixe a senha em branco se não quiser alterá-la</li>
                            <li>Se alterar a senha, ela será criptografada com segurança</li>
                            <li>Não é possível alterar para um CPF já existente</li>
                        </ul>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Salvando...
                            </>
                        ) : (
                            '💾 Salvar Alterações'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UsuarioAlteracaoModal;
