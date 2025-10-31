import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isClienteUser } = useAuth();
    
    const { pedido, endereco, pagamento } = location.state || {};

    useEffect(() => {
        if (!isClienteUser() || !pedido) {
            navigate('/');
            return;
        }
    }, []);

    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    const formatarEndereco = (end) => {
        if (!end) return 'Endereço não disponível';
        return `${end.logradouro}, ${end.numero}${end.complemento ? ', ' + end.complemento : ''} - ${end.bairro}, ${end.cidade}/${end.uf} - CEP: ${end.cep}`;
    };

    const getMetodoPagamentoTexto = (metodo) => {
        const metodos = {
            'pix': 'PIX',
            'cartao': 'Cartão de Crédito',
            'boleto': 'Boleto Bancário',
            'goia_bank': 'GOIA Bank'
        };
        return metodos[metodo] || metodo;
    };

    const getStatusColor = (status) => {
        const cores = {
            'PENDENTE': 'warning',
            'CONFIRMADO': 'info',
            'PREPARANDO': 'primary',
            'ENVIADO': 'success',
            'ENTREGUE': 'success',
            'CANCELADO': 'danger'
        };
        return cores[status] || 'secondary';
    };

    if (!pedido) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    <Alert.Heading>Erro</Alert.Heading>
                    <p>Informações do pedido não encontradas.</p>
                    <Button variant="outline-danger" onClick={() => navigate('/')}>
                        Voltar à Loja
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-5">
            <Row className="justify-content-center">
                <Col lg={8}>
                    {/* Confirmação de Sucesso */}
                    <Card className="text-center mb-4 confirmation-card">
                        <Card.Body className="p-4">
                            <div className="success-icon mb-3">
                                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h2 className="text-success mb-3">Pedido Realizado com Sucesso!</h2>
                            <p className="text-muted mb-0">
                                Seu pedido foi processado e você receberá atualizações por email.
                            </p>
                        </Card.Body>
                    </Card>

                    {/* Informações do Pedido */}
                    <Row className="mb-4">
                        <Col md={6}>
                            <Card className="h-100">
                                <Card.Header>
                                    <h5 className="mb-0">
                                        <i className="bi bi-receipt"></i> Dados do Pedido
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-2">
                                        <strong>Número do Pedido:</strong>
                                        <br />
                                        <span className="text-primary">{pedido.numeroPedido}</span>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Status:</strong>
                                        <br />
                                        <span className={`badge bg-${getStatusColor(pedido.status)}`}>
                                            {pedido.status}
                                        </span>
                                    </div>
                                    <div className="mb-0">
                                        <strong>Valor Total:</strong>
                                        <br />
                                        <span className="fs-5 text-success fw-bold">
                                            {formatarPreco(pedido.valorTotal)}
                                        </span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        <Col md={6}>
                            <Card className="h-100">
                                <Card.Header>
                                    <h5 className="mb-0">
                                        <i className="bi bi-credit-card"></i> Pagamento
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-2">
                                        <strong>Forma de Pagamento:</strong>
                                        <br />
                                        {getMetodoPagamentoTexto(pagamento?.metodo)}
                                    </div>
                                    
                                    {pagamento?.metodo === 'pix' && (
                                        <Alert variant="info" className="mt-3 mb-0">
                                            <small>
                                                <i className="bi bi-info-circle me-2"></i>
                                                O código PIX será enviado por email em instantes.
                                            </small>
                                        </Alert>
                                    )}
                                    
                                    {pagamento?.metodo === 'boleto' && (
                                        <Alert variant="info" className="mt-3 mb-0">
                                            <small>
                                                <i className="bi bi-info-circle me-2"></i>
                                                O boleto será enviado por email em instantes.
                                            </small>
                                        </Alert>
                                    )}
                                    
                                    {pagamento?.metodo === 'cartao' && (
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                Cartão final {pagamento.numeroCartao?.slice(-4)}
                                                {pagamento.parcelas > 1 && (
                                                    <> - {pagamento.parcelas}x de {formatarPreco(pedido.valorTotal / pagamento.parcelas)}</>
                                                )}
                                            </small>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Endereço de Entrega */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <i className="bi bi-geo-alt"></i> Endereço de Entrega
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <p className="mb-0">{formatarEndereco(endereco)}</p>
                        </Card.Body>
                    </Card>

                    {/* Próximos Passos */}
                    <Card className="mb-4 border-info">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-clock"></i> Próximos Passos
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="timeline">
                                <div className="timeline-item">
                                    <i className="bi bi-check-circle-fill text-success"></i>
                                    <span><strong>Pedido Confirmado</strong> - Agora mesmo</span>
                                </div>
                                <div className="timeline-item">
                                    <i className="bi bi-clock text-warning"></i>
                                    <span><strong>Preparação</strong> - Em até 2 horas</span>
                                </div>
                                <div className="timeline-item">
                                    <i className="bi bi-truck text-primary"></i>
                                    <span><strong>Envio</strong> - Em até 1 dia útil</span>
                                </div>
                                <div className="timeline-item">
                                    <i className="bi bi-house text-info"></i>
                                    <span><strong>Entrega</strong> - Em até 5 dias úteis</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Ações */}
                    <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                        <Button 
                            variant="primary" 
                            size="lg"
                            onClick={() => navigate('/meus-pedidos')}
                        >
                            <i className="bi bi-list-ul"></i> Acompanhar Pedidos
                        </Button>
                        
                        <Button 
                            variant="outline-primary" 
                            size="lg"
                            onClick={() => navigate('/')}
                        >
                            <i className="bi bi-house"></i> Continuar Comprando
                        </Button>
                    </div>

                    {/* Suporte */}
                    <Card className="mt-4 bg-light border-0">
                        <Card.Body className="text-center">
                            <h6>Precisa de Ajuda?</h6>
                            <p className="text-muted mb-3">
                                Nossa equipe está pronta para ajudar você!
                            </p>
                            <div className="d-flex justify-content-center gap-3">
                                <Button variant="outline-secondary" size="sm">
                                    <i className="bi bi-whatsapp"></i> WhatsApp
                                </Button>
                                <Button variant="outline-secondary" size="sm">
                                    <i className="bi bi-envelope"></i> Email
                                </Button>
                                <Button variant="outline-secondary" size="sm">
                                    <i className="bi bi-telephone"></i> Telefone
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OrderConfirmationPage;