import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, ProgressBar, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { sha256 } from 'js-sha256';

const CustomerSignup = ({ onBackToLogin }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Estado do formulário
    const [formData, setFormData] = useState({
        // Passo 1: Dados Pessoais
        nomeCompleto: '',
        cpf: '',
        dataNascimento: '',
        genero: '',
        
        // Passo 2: Endereço de Faturamento
        enderecoFaturamento: {
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            uf: ''
        },
        
        // Passo 3: Endereço de Entrega
        enderecosEntrega: [{
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            uf: '',
            isPrincipal: true
        }],
        copiarFaturamento: false,
        
        // Passo 4: Credenciais
        email: '',
        senha: '',
        confirmarSenha: ''
    });

    const [validations, setValidations] = useState({});

    // Função para atualizar campos
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Função para atualizar endereço de faturamento
    const handleEnderecoFaturamentoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            enderecoFaturamento: {
                ...prev.enderecoFaturamento,
                [name]: value
            }
        }));
    };

    // Função para atualizar endereços de entrega
    const handleEnderecoEntregaChange = (index, e) => {
        const { name, value } = e.target;
        const novosEnderecos = [...formData.enderecosEntrega];
        novosEnderecos[index] = {
            ...novosEnderecos[index],
            [name]: value
        };
        setFormData(prev => ({
            ...prev,
            enderecosEntrega: novosEnderecos
        }));
    };

    // Adicionar novo endereço de entrega
    const adicionarEnderecoEntrega = () => {
        setFormData(prev => ({
            ...prev,
            enderecosEntrega: [
                ...prev.enderecosEntrega,
                {
                    cep: '',
                    logradouro: '',
                    numero: '',
                    complemento: '',
                    bairro: '',
                    cidade: '',
                    uf: '',
                    isPrincipal: false
                }
            ]
        }));
    };

    // Remover endereço de entrega
    const removerEnderecoEntrega = (index) => {
        if (formData.enderecosEntrega.length > 1) {
            const novosEnderecos = formData.enderecosEntrega.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                enderecosEntrega: novosEnderecos
            }));
        }
    };

    // Copiar endereço de faturamento para entrega
    const copiarEnderecoFaturamento = () => {
        if (formData.copiarFaturamento) {
            setFormData(prev => ({
                ...prev,
                enderecosEntrega: [{
                    ...prev.enderecoFaturamento,
                    isPrincipal: true
                }]
            }));
        }
    };

    // Consultar CEP no ViaCEP
    const consultarCEP = async (cep, tipo, index = null) => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;

        try {
            // limpa qualquer erro anterior antes de consultar
            setError('');
            const response = await axios.get(`/api/store/customers/validate-cep/${cepLimpo}`);
            const dados = response.data;

            // Caso a API retorne marcação de erro
            if (dados && (dados.erro === true || dados.erro === 'true')) {
                setError('CEP não encontrado');
                return;
            }

            if (tipo === 'faturamento') {
                setFormData(prev => ({
                    ...prev,
                    enderecoFaturamento: {
                        ...prev.enderecoFaturamento,
                        cep: cepLimpo,
                        logradouro: dados.logradouro,
                        bairro: dados.bairro,
                        cidade: dados.localidade,
                        uf: (dados.uf || '').toUpperCase()
                    }
                }));
            } else if (tipo === 'entrega' && index !== null) {
                const novosEnderecos = [...formData.enderecosEntrega];
                novosEnderecos[index] = {
                    ...novosEnderecos[index],
                    cep: cepLimpo,
                    logradouro: dados.logradouro,
                    bairro: dados.bairro,
                    cidade: dados.localidade,
                    uf: (dados.uf || '').toUpperCase()
                };
                setFormData(prev => ({
                    ...prev,
                    enderecosEntrega: novosEnderecos
                }));
            }
            // sucesso: garante remoção do banner de erro
            setError('');
        } catch (error) {
            setError('CEP não encontrado');
        }
    };

    // Validar CPF
    const validarCPF = (cpf) => {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = 11 - (soma % 11);
        let digito1 = resto >= 10 ? 0 : resto;

        if (parseInt(cpf.charAt(9)) !== digito1) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = 11 - (soma % 11);
        let digito2 = resto >= 10 ? 0 : resto;

        return parseInt(cpf.charAt(10)) === digito2;
    };

    // Validar passo atual
    const validarPasso = () => {
        const erros = {};

        if (step === 1) {
            // Validar nome completo
            const nomePartes = formData.nomeCompleto.trim().split(/\s+/);
            if (nomePartes.length < 2 || nomePartes.some(p => p.length < 3)) {
                erros.nomeCompleto = 'Nome deve conter pelo menos 2 palavras com mínimo 3 letras cada';
            }

            // Validar CPF
            if (!validarCPF(formData.cpf)) {
                erros.cpf = 'CPF inválido';
            }

            // Validar data de nascimento
            if (!formData.dataNascimento) {
                erros.dataNascimento = 'Data de nascimento é obrigatória';
            }

            // Validar gênero
            if (!formData.genero) {
                erros.genero = 'Gênero é obrigatório';
            }
        }

        if (step === 2) {
            // Validar endereço de faturamento
            if (!formData.enderecoFaturamento.cep) {
                erros.cep = 'CEP é obrigatório';
            }
            if (!formData.enderecoFaturamento.numero) {
                erros.numero = 'Número é obrigatório';
            }
        }

        if (step === 3) {
            // Validar endereços de entrega
            formData.enderecosEntrega.forEach((end, index) => {
                if (!end.cep) {
                    erros[`entrega_cep_${index}`] = 'CEP é obrigatório';
                }
                if (!end.numero) {
                    erros[`entrega_numero_${index}`] = 'Número é obrigatório';
                }
            });
        }

        if (step === 4) {
            // Validar email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                erros.email = 'Email inválido';
            }

            // Validar senha
            if (formData.senha.length < 6) {
                erros.senha = 'Senha deve ter no mínimo 6 caracteres';
            }

            // Validar confirmação
            if (formData.senha !== formData.confirmarSenha) {
                erros.confirmarSenha = 'As senhas não conferem';
            }
        }

        setValidations(erros);
        return Object.keys(erros).length === 0;
    };

    // Avançar para próximo passo
    const proximoPasso = () => {
        if (validarPasso()) {
            setStep(step + 1);
            setError('');
        }
    };

    // Voltar para passo anterior
    const passoAnterior = () => {
        setStep(step - 1);
        setError('');
    };

    // Submeter formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarPasso()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Hash SHA-256 da senha
            const senhaHash = sha256(formData.senha);

            // Preparar dados para envio
            const dados = {
                nomeCompleto: formData.nomeCompleto,
                cpf: formData.cpf.replace(/\D/g, ''),
                dataNascimento: formData.dataNascimento,
                genero: formData.genero,
                email: formData.email,
                senhaHash: senhaHash,
                enderecoFaturamento: {
                    ...formData.enderecoFaturamento,
                    cep: formData.enderecoFaturamento.cep.replace(/\D/g, '')
                },
                enderecosEntrega: formData.enderecosEntrega.map(end => ({
                    ...end,
                    cep: end.cep.replace(/\D/g, '')
                }))
            };

            await axios.post('/api/store/customers/signup', dados);
            
            setSuccess(true);
            setTimeout(() => {
                onBackToLogin();
            }, 2000);

        } catch (error) {
            if (error.response) {
                if (error.response.status === 409) {
                    setError('Email ou CPF já cadastrado');
                } else if (error.response.status === 422) {
                    setError(error.response.data.message || 'Dados inválidos');
                } else {
                    setError('Erro ao processar cadastro');
                }
            } else {
                setError('Erro de conexão com o servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    // Máscara de CPF
    const mascaraCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    // Máscara de CEP
    const mascaraCEP = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
    };

    if (success) {
        return (
            <Container className="mt-5">
                <Card className="mx-auto" style={{ maxWidth: '600px' }}>
                    <Card.Body className="text-center">
                        <Alert variant="success">
                            <h4>✓ Cadastro realizado com sucesso!</h4>
                            <p>Redirecionando para o login...</p>
                        </Alert>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Card className="mx-auto" style={{ maxWidth: '800px' }}>
                <Card.Header>
                    <h3 className="text-center mb-3">Cadastro de Cliente</h3>
                    <ProgressBar now={(step / 4) * 100} label={`Passo ${step} de 4`} />
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        {/* PASSO 1: DADOS PESSOAIS */}
                        {step === 1 && (
                            <>
                                <h5 className="mb-3">Dados Pessoais</h5>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Nome Completo *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nomeCompleto"
                                        value={formData.nomeCompleto}
                                        onChange={handleChange}
                                        isInvalid={validations.nomeCompleto}
                                        placeholder="Ex: João Silva Santos"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validations.nomeCompleto}
                                    </Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                        Mínimo 2 palavras com 3 letras cada
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>CPF *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="cpf"
                                        value={mascaraCPF(formData.cpf)}
                                        onChange={(e) => handleChange({ target: { name: 'cpf', value: e.target.value.replace(/\D/g, '') } })}
                                        isInvalid={validations.cpf}
                                        placeholder="000.000.000-00"
                                        maxLength="14"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validations.cpf}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Data de Nascimento *</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="dataNascimento"
                                                value={formData.dataNascimento}
                                                onChange={handleChange}
                                                isInvalid={validations.dataNascimento}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {validations.dataNascimento}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Gênero *</Form.Label>
                                            <Form.Select
                                                name="genero"
                                                value={formData.genero}
                                                onChange={handleChange}
                                                isInvalid={validations.genero}
                                                required
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="MASCULINO">Masculino</option>
                                                <option value="FEMININO">Feminino</option>
                                                <option value="OUTRO">Outro</option>
                                                <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {validations.genero}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {/* PASSO 2: ENDEREÇO DE FATURAMENTO */}
                        {step === 2 && (
                            <>
                                <h5 className="mb-3">Endereço de Faturamento</h5>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>CEP *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="cep"
                                        value={mascaraCEP(formData.enderecoFaturamento.cep)}
                                        onChange={(e) => {
                                            const cep = e.target.value.replace(/\D/g, '');
                                            handleEnderecoFaturamentoChange({ target: { name: 'cep', value: cep } });
                                            // limpando mensagem de erro durante a digitação
                                            setError('');
                                            if (cep.length === 8) {
                                                consultarCEP(cep, 'faturamento');
                                            }
                                        }}
                                        isInvalid={validations.cep}
                                        placeholder="00000-000"
                                        maxLength="9"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validations.cep}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Logradouro *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="logradouro"
                                        value={formData.enderecoFaturamento.logradouro}
                                        onChange={handleEnderecoFaturamentoChange}
                                        required
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Número *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="numero"
                                                value={formData.enderecoFaturamento.numero}
                                                onChange={handleEnderecoFaturamentoChange}
                                                isInvalid={validations.numero}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {validations.numero}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Complemento</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="complemento"
                                                value={formData.enderecoFaturamento.complemento}
                                                onChange={handleEnderecoFaturamentoChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Bairro *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="bairro"
                                        value={formData.enderecoFaturamento.bairro}
                                        onChange={handleEnderecoFaturamentoChange}
                                        required
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Cidade *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="cidade"
                                                value={formData.enderecoFaturamento.cidade}
                                                onChange={handleEnderecoFaturamentoChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>UF *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="uf"
                                                value={formData.enderecoFaturamento.uf}
                                                onChange={handleEnderecoFaturamentoChange}
                                                maxLength="2"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {/* PASSO 3: ENDEREÇO DE ENTREGA */}
                        {step === 3 && (
                            <>
                                <h5 className="mb-3">Endereço de Entrega</h5>
                                
                                <Form.Check
                                    type="checkbox"
                                    label="Copiar endereço de faturamento"
                                    name="copiarFaturamento"
                                    checked={formData.copiarFaturamento}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (e.target.checked) {
                                            copiarEnderecoFaturamento();
                                        }
                                    }}
                                    className="mb-3"
                                />

                                {formData.enderecosEntrega.map((endereco, index) => (
                                    <Card key={index} className="mb-3">
                                        <Card.Header className="d-flex justify-content-between align-items-center">
                                            <span>Endereço {index + 1}</span>
                                            {index > 0 && (
                                                <Button 
                                                    variant="danger" 
                                                    size="sm"
                                                    onClick={() => removerEnderecoEntrega(index)}
                                                >
                                                    Remover
                                                </Button>
                                            )}
                                        </Card.Header>
                                        <Card.Body>
                                            <Form.Group className="mb-3">
                                                <Form.Label>CEP *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={mascaraCEP(endereco.cep)}
                                                    onChange={(e) => {
                                                        const cep = e.target.value.replace(/\D/g, '');
                                                        handleEnderecoEntregaChange(index, { target: { name: 'cep', value: cep } });
                                                        setError('');
                                                        if (cep.length === 8) {
                                                            consultarCEP(cep, 'entrega', index);
                                                        }
                                                    }}
                                                    isInvalid={validations[`entrega_cep_${index}`]}
                                                    placeholder="00000-000"
                                                    maxLength="9"
                                                    required
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {validations[`entrega_cep_${index}`]}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Logradouro *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="logradouro"
                                                    value={endereco.logradouro}
                                                    onChange={(e) => handleEnderecoEntregaChange(index, e)}
                                                    required
                                                />
                                            </Form.Group>

                                            <Row>
                                                <Col md={4}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Número *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="numero"
                                                            value={endereco.numero}
                                                            onChange={(e) => handleEnderecoEntregaChange(index, e)}
                                                            isInvalid={validations[`entrega_numero_${index}`]}
                                                            required
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {validations[`entrega_numero_${index}`]}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={8}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Complemento</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="complemento"
                                                            value={endereco.complemento}
                                                            onChange={(e) => handleEnderecoEntregaChange(index, e)}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Bairro *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="bairro"
                                                    value={endereco.bairro}
                                                    onChange={(e) => handleEnderecoEntregaChange(index, e)}
                                                    required
                                                />
                                            </Form.Group>

                                            <Row>
                                                <Col md={8}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Cidade *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="cidade"
                                                            value={endereco.cidade}
                                                            onChange={(e) => handleEnderecoEntregaChange(index, e)}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>UF *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="uf"
                                                            value={endereco.uf}
                                                            onChange={(e) => handleEnderecoEntregaChange(index, e)}
                                                            maxLength="2"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                ))}

                                <Button 
                                    variant="outline-primary" 
                                    onClick={adicionarEnderecoEntrega}
                                    className="w-100 mb-3"
                                >
                                    + Adicionar outro endereço de entrega
                                </Button>
                            </>
                        )}

                        {/* PASSO 4: CREDENCIAIS */}
                        {step === 4 && (
                            <>
                                <h5 className="mb-3">Crie sua Senha</h5>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        isInvalid={validations.email}
                                        placeholder="seu@email.com"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validations.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Senha *</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="senha"
                                        value={formData.senha}
                                        onChange={handleChange}
                                        isInvalid={validations.senha}
                                        placeholder="Mínimo 6 caracteres"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validations.senha}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Confirmar Senha *</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmarSenha"
                                        value={formData.confirmarSenha}
                                        onChange={handleChange}
                                        isInvalid={validations.confirmarSenha}
                                        placeholder="Digite a senha novamente"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validations.confirmarSenha}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </>
                        )}

                        {/* BOTÕES DE NAVEGAÇÃO */}
                        <div className="d-flex justify-content-between mt-4">
                            {step > 1 ? (
                                <Button 
                                    variant="secondary" 
                                    onClick={passoAnterior}
                                    disabled={loading}
                                >
                                    ← Voltar
                                </Button>
                            ) : (
                                <Button 
                                    variant="link" 
                                    onClick={onBackToLogin}
                                >
                                    Voltar para Login
                                </Button>
                            )}

                            {step < 4 ? (
                                <Button 
                                    variant="primary" 
                                    onClick={proximoPasso}
                                    disabled={loading}
                                >
                                    Próximo →
                                </Button>
                            ) : (
                                <Button 
                                    variant="success" 
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                                </Button>
                            )}
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CustomerSignup;
