import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import api from '../utils/api';

const ProductCadastroModal = ({ show, onHide, onSuccess }) => {
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        preco: '',
        quantidadeEstoque: '',
        avaliacao: '',
        status: 'ATIVO'
    });
    const [files, setFiles] = useState([]);
    const [principalImageIndex, setPrincipalImageIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: dados, 2: imagens
    const [debugInfo, setDebugInfo] = useState('Nenhum arquivo selecionado');

    // Debug: Monitorar mudanças no estado files
    useEffect(() => {
        const info = files.length > 0 
            ? `${files.length} arquivos: ${files.map(f => f.name).join(', ')}`
            : 'Nenhum arquivo selecionado';
        console.log('🔍 useEffect files mudou:', files.length, files);
        console.log('🔍 Stack trace:', new Error().stack);
        setDebugInfo(info);
    }, [files]);

    // Debug: Monitorar mudanças no modal show
    useEffect(() => {
        console.log('🔍 Modal show mudou:', show);
        if (!show) {
            console.log('🔍 Modal foi fechado - files serão resetados');
        }
    }, [show]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        console.log('📁 handleFileChange chamado');
        console.log('📁 Arquivos selecionados:', selectedFiles.length, selectedFiles);
        console.log('📁 Event target:', e.target);
        console.log('📁 Event target files:', e.target.files);
        
        // Validar quantidade máxima
        if (selectedFiles.length > 5) {
            setError('Máximo 5 imagens permitidas');
            return;
        }
        
        // Validar tipos de arquivo
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const invalidFiles = selectedFiles.filter(file => !validTypes.includes(file.type));
        
        if (invalidFiles.length > 0) {
            setError('Apenas imagens (JPEG, PNG, GIF, WebP) são permitidas');
            return;
        }
        
        // Validar tamanho (5MB por arquivo)
        const oversizedFiles = selectedFiles.filter(file => file.size > 5 * 1024 * 1024);
        
        if (oversizedFiles.length > 0) {
            setError('Cada imagem deve ter no máximo 5MB');
            return;
        }

        console.log('📁 Definindo files com:', selectedFiles.length, 'arquivos');
        setFiles(selectedFiles);
        setError('');
        setPrincipalImageIndex(0); // Primeira imagem como principal por padrão
        
        console.log('📁 handleFileChange concluído');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🚀 === INÍCIO DO SUBMIT ===');
        console.log('🚀 Step atual:', step);
        console.log('🚀 Files no submit:', files.length, files);
        console.log('🚀 FormData:', formData);
        console.log('🚀 Principal index:', principalImageIndex);
        
        // Só deve submeter se estiver no step 2
        if (step !== 2) {
            console.log('🚫 Submit cancelado - não está no step 2');
            return;
        }
        
        setLoading(true);
        setError('');
        setUploadProgress('Criando produto...');

        try {
            // Validações
            if (!formData.nome.trim()) {
                throw new Error('Nome do produto é obrigatório');
            }
            
            if (!formData.preco || parseFloat(formData.preco) <= 0) {
                throw new Error('Preço deve ser maior que zero');
            }
            
            if (!formData.quantidadeEstoque || parseInt(formData.quantidadeEstoque) < 0) {
                throw new Error('Quantidade em estoque deve ser zero ou maior');
            }
            
            if (formData.avaliacao && (parseFloat(formData.avaliacao) < 1 || parseFloat(formData.avaliacao) > 5)) {
                throw new Error('Avaliação deve estar entre 1 e 5');
            }

            // 1. Cadastrar produto
            const produtoData = {
                nome: formData.nome.trim(),
                descricao: formData.descricao.trim(),
                preco: parseFloat(formData.preco),
                quantidadeEstoque: parseInt(formData.quantidadeEstoque),
                avaliacao: formData.avaliacao ? parseFloat(formData.avaliacao) : null,
                status: formData.status
            };

            const produtoResponse = await api.post('/produtos', produtoData);
            const produto = produtoResponse.data;

            // 2. Fazer upload das imagens (se houver)
            if (files.length > 0) {
                console.log(`Iniciando upload de ${files.length} imagens para produto ID ${produto.id}`);
                
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    setUploadProgress(`Fazendo upload da imagem ${i + 1} de ${files.length}...`);
                    
                    const formDataImg = new FormData();
                    formDataImg.append('file', file);
                    formDataImg.append('isPrincipal', i === principalImageIndex ? 'true' : 'false');
                    formDataImg.append('ordem', i.toString());

                    console.log(`Fazendo upload da imagem ${i + 1}/${files.length}: ${file.name}`);
                    
                    try {
                        // Não definir Content-Type para FormData - o browser define automaticamente
                        const uploadResponse = await api.post(`/produtos/${produto.id}/images`, formDataImg);
                        console.log(`Upload da imagem ${i + 1} concluído:`, uploadResponse.data);
                    } catch (uploadError) {
                        console.error(`Erro no upload da imagem ${i + 1}:`, uploadError);
                        throw new Error(`Erro ao fazer upload da imagem ${file.name}: ${uploadError.response?.data || uploadError.message}`);
                    }
                }
                
                console.log('Todos os uploads concluídos com sucesso!');
                setUploadProgress('Upload das imagens concluído!');
            } else {
                console.log('Nenhuma imagem selecionada para upload');
            }

            // Sucesso
            console.log('✅ Produto criado com sucesso!');
            
            // Aguardar um pouco antes de fechar o modal e atualizar a lista
            setTimeout(() => {
                console.log('✅ Chamando onSuccess após timeout...');
                onSuccess && onSuccess();
                console.log('✅ Chamando handleClose após timeout...');
                handleClose();
            }, 500);
            
        } catch (err) {
            const errorMsg = err.response?.data || err.message || 'Erro ao cadastrar produto';
            setError(errorMsg);
        } finally {
            setLoading(false);
            setUploadProgress('');
        }
    };

    const handleClose = () => {
        console.log('🔍 handleClose chamado! Step atual:', step);
        console.log('🔍 Stack trace do handleClose:', new Error().stack);
        
        // Prevenir fechamento acidental durante upload
        if (loading) {
            console.log('🚫 Bloqueando handleClose durante loading');
            return;
        }
        
        setFormData({
            nome: '',
            descricao: '',
            preco: '',
            quantidadeEstoque: '',
            avaliacao: '',
            status: 'ATIVO'
        });
        setFiles([]);
        setPrincipalImageIndex(0);
        setError('');
        setStep(1);
        setDebugInfo('Nenhum arquivo selecionado');
        onHide();
    };

    const nextStep = (e) => {
        // Prevenir submit do formulário
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log('📝 nextStep chamado - validando dados...');
        
        // Validar antes de ir para o próximo passo
        if (!formData.nome.trim()) {
            setError('Nome é obrigatório');
            return;
        }
        if (!formData.preco || parseFloat(formData.preco) <= 0) {
            setError('Preço deve ser maior que zero');
            return;
        }
        if (!formData.quantidadeEstoque || parseInt(formData.quantidadeEstoque) < 0) {
            setError('Quantidade em estoque deve ser zero ou maior');
            return;
        }
        
        console.log('📝 Dados válidos, indo para step 2');
        setError('');
        setStep(2);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Cadastrar Produto - {step === 1 ? 'Dados Básicos' : 'Imagens'}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    {step === 1 && (
                        <>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nome do Produto *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Preço *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            name="preco"
                                            value={formData.preco}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Descrição</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>

                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Quantidade em Estoque *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="quantidadeEstoque"
                                            value={formData.quantidadeEstoque}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Avaliação</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.1"
                                            min="1"
                                            max="5"
                                            name="avaliacao"
                                            value={formData.avaliacao}
                                            onChange={handleInputChange}
                                        />
                                        <Form.Text className="text-muted">
                                            Opcional - passo 0.5
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="ATIVO">Ativo</option>
                                            <option value="INATIVO">Inativo</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* Upload de imagens */}
                            <Form.Group className="mb-3">
                                <Form.Label>Imagens do Produto</Form.Label>
                                <Form.Control
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileChange}
                                />
                                <Form.Text className="text-muted">
                                    Máximo 5 imagens. Formatos: JPEG, PNG, GIF, WebP (máx. 5MB cada)
                                </Form.Text>
                                
                                {/* Debug Info */}
                                <Alert variant="info" className="mt-2">
                                    <small><strong>Debug:</strong> {debugInfo}</small>
                                    <br />
                                    <Button 
                                        size="sm" 
                                        variant="outline-info" 
                                        onClick={() => console.log('📋 Estado atual files:', files.length, files)}
                                        className="mt-1"
                                    >
                                        Testar Estado Files
                                    </Button>
                                </Alert>
                            </Form.Group>

                            {/* Preview das imagens */}
                            {files.length > 0 && (
                                <Card className="mb-3">
                                    <Card.Header>
                                        <strong>Preview das Imagens ({files.length})</strong>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            {files.map((file, index) => (
                                                <Col key={index} md={3} className="mb-3">
                                                    <Card>
                                                        <Card.Img
                                                            variant="top"
                                                            src={URL.createObjectURL(file)}
                                                            style={{ height: '150px', objectFit: 'cover' }}
                                                        />
                                                        <Card.Body className="p-2">
                                                            <small className="text-muted d-block">
                                                                {file.name}
                                                            </small>
                                                            <small className="text-muted d-block">
                                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                                            </small>
                                                            <Form.Check
                                                                type="radio"
                                                                name="principal"
                                                                label="Principal"
                                                                checked={index === principalImageIndex}
                                                                onChange={() => setPrincipalImageIndex(index)}
                                                                className="mt-2"
                                                            />
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                        <Alert variant="info" className="mt-2">
                                            <strong>Imagem Principal:</strong> A imagem marcada como "Principal" será 
                                            exibida como destaque nas listagens do produto.
                                        </Alert>
                                    </Card.Body>
                                </Card>
                            )}
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    {uploadProgress && (
                        <div className="w-100 mb-2">
                            <small className="text-muted">{uploadProgress}</small>
                        </div>
                    )}
                    {step === 1 ? (
                        <>
                            <Button variant="secondary" onClick={handleClose} type="button">
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={nextStep} type="button">
                                Próximo: Imagens →
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={() => setStep(1)} type="button">
                                ← Voltar
                            </Button>
                            <Button variant="success" type="submit" disabled={loading}>
                                {loading ? 'Cadastrando...' : 'Salvar Produto'}
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ProductCadastroModal;