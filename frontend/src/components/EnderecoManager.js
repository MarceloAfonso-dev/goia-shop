import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import api from '../utils/api';

const EnderecoManager = ({ show, onHide }) => {
    const [enderecos, setEnderecos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEndereco, setSelectedEndereco] = useState(null);
    const [formData, setFormData] = useState({
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

    useEffect(() => {
        if (show) {
            carregarEnderecos();
        }
    }, [show]);

    const carregarEnderecos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cliente/enderecos');
            if (response.data.success) {
                setEnderecos(response.data.enderecos);
            }
        } catch (err) {
            console.error('Erro ao carregar endereços:', err);
            setError('Erro ao carregar endereços');
        } finally {
            setLoading(false);
        }
    };

    const buscarCEP = async (cep) => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
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

    const handleCepChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.substring(0, 8);
        const formatted = value.replace(/(\d{5})(\d{3})/, '$1-$2');
        
        setFormData(prev => ({ ...prev, cep: formatted }));

        if (value.length === 8) {
            buscarCEP(value);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;
        
        // Converter estado para maiúsculas e limitar a 2 caracteres
        if (name === 'estado') {
            finalValue = value.toUpperCase().substring(0, 2);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const handleAdicionar = () => {
        setFormData({
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            apelido: '',
            isPadrao: enderecos.length === 0 // Primeiro endereço é padrão automaticamente
        });
        setSelectedEndereco(null);
        setShowAddModal(true);
        setError('');
        setSuccess('');
    };

    const handleEditar = (endereco) => {
        setFormData({
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
        setSelectedEndereco(endereco);
        setShowEditModal(true);
        setError('');
        setSuccess('');
    };

    const handleSalvar = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validações adicionais
        if (!formData.cep || formData.cep.replace(/\D/g, '').length !== 8) {
            setError('CEP inválido. Deve conter 8 dígitos.');
            setLoading(false);
            return;
        }

        if (!formData.estado || formData.estado.length !== 2) {
            setError('Estado (UF) é obrigatório e deve ter 2 caracteres.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                cep: formData.cep.replace(/\D/g, ''),
                estado: formData.estado.toUpperCase() // Garantir que está em maiúsculas
            };

            let response;
            if (selectedEndereco) {
                // Atualizar endereço existente
                response = await api.put(`/cliente/enderecos/${selectedEndereco.id}`, payload);
            } else {
                // Adicionar novo endereço
                response = await api.post('/cliente/enderecos', payload);
            }

            if (response.data.success) {
                setSuccess(response.data.message);
                await carregarEnderecos();
                setShowAddModal(false);
                setShowEditModal(false);
            }
        } catch (err) {
            console.error('Erro ao salvar endereço:', err);
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

    const handleRemover = async () => {
        try {
            setLoading(true);
            const response = await api.delete(`/cliente/enderecos/${selectedEndereco.id}`);
            
            if (response.data.success) {
                setSuccess('Endereço removido com sucesso');
                await carregarEnderecos();
                setShowDeleteModal(false);
            }
        } catch (err) {
            console.error('Erro ao remover endereço:', err);
            setError(err.response?.data?.message || 'Erro ao remover endereço');
        } finally {
            setLoading(false);
        }
    };

    const formatCEP = (cep) => {
        if (!cep) return '';
        const numbers = cep.replace(/\D/g, '');
        return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    };

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>📍 Meus Endereços de Entrega</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                    {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

                    <div className="mb-3">
                        <Button variant="primary" onClick={handleAdicionar}>
                            ➕ Adicionar Novo Endereço
                        </Button>
                    </div>

                    {loading && enderecos.length === 0 ? (
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </div>
                        </div>
                    ) : enderecos.length === 0 ? (
                        <Alert variant="info">
                            Você ainda não possui endereços cadastrados. Adicione um novo endereço para facilitar suas compras.
                        </Alert>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {enderecos.map((endereco) => (
                                <div 
                                    key={endereco.id}
                                    style={{
                                        border: endereco.isPadrao ? '2px solid #FF4F5A' : '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        backgroundColor: endereco.isPadrao ? '#fff5f5' : 'white',
                                        position: 'relative'
                                    }}
                                >
                                    {endereco.isPadrao && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            backgroundColor: '#FF4F5A',
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            ⭐ PADRÃO
                                        </span>
                                    )}

                                    {endereco.apelido && (
                                        <h6 style={{ color: '#FF4F5A', marginBottom: '8px' }}>
                                            📌 {endereco.apelido}
                                        </h6>
                                    )}

                                    <div style={{ marginBottom: '12px' }}>
                                        <p style={{ margin: '4px 0', fontSize: '14px' }}>
                                            <strong>CEP:</strong> {formatCEP(endereco.cep)}
                                        </p>
                                        <p style={{ margin: '4px 0', fontSize: '14px' }}>
                                            <strong>Endereço:</strong> {endereco.logradouro}, {endereco.numero}
                                        </p>
                                        {endereco.complemento && (
                                            <p style={{ margin: '4px 0', fontSize: '14px' }}>
                                                <strong>Complemento:</strong> {endereco.complemento}
                                            </p>
                                        )}
                                        <p style={{ margin: '4px 0', fontSize: '14px' }}>
                                            <strong>Bairro:</strong> {endereco.bairro}
                                        </p>
                                        <p style={{ margin: '4px 0', fontSize: '14px' }}>
                                            <strong>Cidade/UF:</strong> {endereco.cidade} - {endereco.estado}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {!endereco.isPadrao && (
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm"
                                                onClick={() => handleDefinirPadrao(endereco.id)}
                                                disabled={loading}
                                            >
                                                ⭐ Definir como Padrão
                                            </Button>
                                        )}
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm"
                                            onClick={() => handleEditar(endereco)}
                                        >
                                            ✏️ Editar
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => {
                                                setSelectedEndereco(endereco);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            🗑️ Remover
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Adicionar/Editar Endereço */}
            <Modal show={showAddModal || showEditModal} onHide={() => { setShowAddModal(false); setShowEditModal(false); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedEndereco ? 'Editar Endereço' : 'Adicionar Novo Endereço'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSalvar}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form.Group className="mb-3">
                            <Form.Label>Apelido (Opcional)</Form.Label>
                            <Form.Control
                                type="text"
                                name="apelido"
                                value={formData.apelido}
                                onChange={handleInputChange}
                                placeholder="Ex: Casa, Trabalho, Casa da Mãe"
                                maxLength={50}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>CEP *</Form.Label>
                            <Form.Control
                                type="text"
                                name="cep"
                                value={formData.cep}
                                onChange={handleCepChange}
                                placeholder="00000-000"
                                required
                                maxLength={9}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Logradouro *</Form.Label>
                            <Form.Control
                                type="text"
                                name="logradouro"
                                value={formData.logradouro}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <div className="row">
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Número *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="numero"
                                        value={formData.numero}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-8">
                                <Form.Group className="mb-3">
                                    <Form.Label>Complemento</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="complemento"
                                        value={formData.complemento}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Bairro *</Form.Label>
                            <Form.Control
                                type="text"
                                name="bairro"
                                value={formData.bairro}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <div className="row">
                            <div className="col-md-8">
                                <Form.Group className="mb-3">
                                    <Form.Label>Cidade *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="cidade"
                                        value={formData.cidade}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>UF *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleInputChange}
                                        required
                                        maxLength={2}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        {enderecos.length > 0 && (
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    name="isPadrao"
                                    label="Definir como endereço padrão"
                                    checked={formData.isPadrao}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Confirmar Exclusão */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Exclusão</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Tem certeza que deseja remover este endereço?</p>
                    {selectedEndereco?.apelido && (
                        <p><strong>{selectedEndereco.apelido}</strong></p>
                    )}
                    {selectedEndereco && (
                        <p style={{ fontSize: '14px', color: '#666' }}>
                            {selectedEndereco.logradouro}, {selectedEndereco.numero}<br/>
                            {selectedEndereco.bairro} - {selectedEndereco.cidade}/{selectedEndereco.estado}
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleRemover} disabled={loading}>
                        {loading ? 'Removendo...' : 'Sim, Remover'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default EnderecoManager;
