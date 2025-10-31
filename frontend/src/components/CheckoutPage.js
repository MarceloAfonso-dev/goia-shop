import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EcommerceHeader from './EcommerceHeader';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartCount, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: Endereço, 2: Frete, 3: Pagamento, 4: Confirmação

  // Estados para endereços salvos
  const [enderecosSalvos, setEnderecosSalvos] = useState([]);
  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState(null);
  const [usarNovoEndereco, setUsarNovoEndereco] = useState(false);
  const [salvarNovoEndereco, setSalvarNovoEndereco] = useState(true);

  // Estados do formulário
  const [enderecoData, setEnderecoData] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });

  const [freteOptions, setFreteOptions] = useState([]);
  const [freteSelecionado, setFreteSelecionado] = useState(null);
  const [loadingFrete, setLoadingFrete] = useState(false);

  const [pagamentoData, setPagamentoData] = useState({
    formaPagamento: 'PIX',
    observacoes: '',
    // Dados do cartão
    numeroCartao: '',
    nomeCartao: '',
    validadeCartao: '',
    cvvCartao: '',
    parcelasCartao: 1
  });

  // Estado para countdown do redirecionamento
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    // Verificar se tem itens no carrinho (mas não redirecionar se já estiver no step 4 - sucesso)
    if (cartCount === 0 && step !== 4) {
      navigate('/carrinho');
      return;
    }

    // Carregar dados do usuário se disponível (opcional)
    if (step !== 4) {
      loadUserAddress();
      carregarEnderecosSalvos();
    }
  }, [user, cartCount, navigate, step]);

  // useEffect para countdown e redirecionamento automático
  useEffect(() => {
    if (step === 4) {
      setCountdown(8); // Reset countdown quando chegar no step 4
      
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            navigate('/produtos');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdownTimer);
    }
  }, [step, navigate]);

  const loadUserAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8080/api/cliente/perfil', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.endereco) {
          setEnderecoData({
            cep: userData.endereco.cep || '',
            logradouro: userData.endereco.logradouro || '',
            numero: userData.endereco.numero || '',
            complemento: userData.endereco.complemento || '',
            bairro: userData.endereco.bairro || '',
            cidade: userData.endereco.cidade || '',
            uf: userData.endereco.estado || ''
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar endereço:', error);
    }
  };
  
  const carregarEnderecosSalvos = async () => {
    try {
      const response = await api.get('/cliente/enderecos');
      if (response.data.success && response.data.enderecos) {
        setEnderecosSalvos(response.data.enderecos);
        
        // Selecionar automaticamente o endereço padrão
        const enderecoPadrao = response.data.enderecos.find(e => e.isPadrao);
        if (enderecoPadrao) {
          setEnderecoSelecionadoId(enderecoPadrao.id);
          setEnderecoData({
            cep: enderecoPadrao.cep || '',
            logradouro: enderecoPadrao.logradouro || '',
            numero: enderecoPadrao.numero || '',
            complemento: enderecoPadrao.complemento || '',
            bairro: enderecoPadrao.bairro || '',
            cidade: enderecoPadrao.cidade || '',
            uf: enderecoPadrao.estado || ''
          });
        } else if (response.data.enderecos.length > 0) {
          // Se não houver padrão, selecionar o primeiro
          const primeiroEndereco = response.data.enderecos[0];
          setEnderecoSelecionadoId(primeiroEndereco.id);
          setEnderecoData({
            cep: primeiroEndereco.cep || '',
            logradouro: primeiroEndereco.logradouro || '',
            numero: primeiroEndereco.numero || '',
            complemento: primeiroEndereco.complemento || '',
            bairro: primeiroEndereco.bairro || '',
            cidade: primeiroEndereco.cidade || '',
            uf: primeiroEndereco.estado || ''
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar endereços salvos:', error);
    }
  };
  
  const handleSelecionarEndereco = (endereco) => {
    setEnderecoSelecionadoId(endereco.id);
    setUsarNovoEndereco(false);
    setEnderecoData({
      cep: endereco.cep || '',
      logradouro: endereco.logradouro || '',
      numero: endereco.numero || '',
      complemento: endereco.complemento || '',
      bairro: endereco.bairro || '',
      cidade: endereco.cidade || '',
      uf: endereco.estado || ''
    });
  };

  const handleEnderecoChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatação do CEP
    if (name === 'cep') {
      const numbers = value.replace(/\D/g, '');
      formattedValue = numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    setEnderecoData({
      ...enderecoData,
      [name]: formattedValue
    });

    // Buscar CEP automaticamente
    if (name === 'cep' && value.replace(/\D/g, '').length === 8) {
      buscarCEP(value.replace(/\D/g, ''));
    }
  };

  const buscarCEP = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setEnderecoData(prev => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const salvarEnderecoNaConta = async () => {
    if (!user || !salvarNovoEndereco) return;
    
    try {
      const novoEndereco = {
        cep: enderecoData.cep,
        logradouro: enderecoData.logradouro,
        numero: enderecoData.numero,
        complemento: enderecoData.complemento,
        bairro: enderecoData.bairro,
        cidade: enderecoData.cidade,
        estado: enderecoData.uf,
        apelido: `Endereço ${enderecosSalvos.length + 1}`,
        isPadrao: enderecosSalvos.length === 0 // Primeiro endereço vira padrão
      };

      await api.post('/cliente/enderecos', novoEndereco);
      
      // Recarregar endereços salvos
      await carregarEnderecosSalvos();
      
      console.log('✅ Endereço salvo na conta com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
    }
  };

  const calcularFrete = async () => {
    if (!enderecoData.cep) {
      setError('CEP é obrigatório para calcular o frete');
      return;
    }

    setLoadingFrete(true);
    setError('');

    try {
      // Salvar endereço na conta se o usuário optou por isso
      if (usarNovoEndereco && salvarNovoEndereco) {
        await salvarEnderecoNaConta();
      }
      const response = await fetch('http://localhost:8080/api/frete/calcular', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cep: enderecoData.cep,
          valorTotal: getCartTotal()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFreteOptions(result.opcoes);
        setStep(2);
      } else {
        setError(result.message || 'Erro ao calcular frete');
      }
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoadingFrete(false);
    }
  };

  const finalizarPedido = async () => {
    // Verificar se está logado no momento da finalização
    if (!user) {
      navigate('/login');
      return;
    }

    if (!freteSelecionado) {
      setError('Selecione uma opção de frete');
      return;
    }

    // Validar dados do cartão se necessário
    if (!validarCartao()) {
      setError('Preencha todos os dados do cartão corretamente');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Preparar dados do pedido
      const dadosPedido = {
        itens: cart.map(item => ({
          produtoId: item.id,
          quantidade: item.quantity,
          preco: item.price
        })),
        dadosPedido: {
          observacoes: pagamentoData.observacoes,
          formaPagamento: pagamentoData.formaPagamento,
          // Dados do cartão se for cartão de crédito
          ...(pagamentoData.formaPagamento === 'CARTAO' && {
            numeroCartao: pagamentoData.numeroCartao,
            nomeCartao: pagamentoData.nomeCartao,
            validadeCartao: pagamentoData.validadeCartao,
            cvvCartao: pagamentoData.cvvCartao,
            parcelasCartao: parseInt(pagamentoData.parcelasCartao)
          })
        }
      };

      // Enviar pedido para o backend
      const response = await api.post('/pedidos', dadosPedido);

      if (response.data.success) {
        const pedidoData = response.data.pedido;
        
        // Dados para mostrar no sucesso
        const compraData = {
          numeroPedido: `GOIA${pedidoData.id}`,
          valorTotal: getTotalComFrete(),
          formaPagamento: pagamentoData.formaPagamento,
          frete: freteSelecionado,
          itens: cart.length,
          enderecoEntrega: `${enderecoData.logradouro}, ${enderecoData.numero} - ${enderecoData.cidade}/${enderecoData.uf}`,
          pedidoId: pedidoData.id
        };
        
        setSuccess('Pedido realizado com sucesso!');
        setStep(4);
        
        // Salvar dados da compra para mostrar no popup
        localStorage.setItem('ultimaCompra', JSON.stringify(compraData));
        
        // Limpar carrinho
        clearCart();
      } else {
        setError(response.data.message || 'Erro ao processar pedido');
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Erro ao processar pagamento');
      } else {
        setError('Erro ao conectar com o servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price || 0);
  };

  // Funções para formatação de cartão
  const formatCardNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
  };

  const formatCardExpiry = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    return numbers.substring(0, 2) + '/' + numbers.substring(2, 4);
  };

  const formatCVV = (value) => {
    return value.replace(/\D/g, '').substring(0, 4);
  };

  const handlePagamentoChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'numeroCartao') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'validadeCartao') {
      formattedValue = formatCardExpiry(value);
    } else if (name === 'cvvCartao') {
      formattedValue = formatCVV(value);
    } else if (name === 'nomeCartao') {
      formattedValue = value.toUpperCase();
    }

    setPagamentoData({
      ...pagamentoData,
      [name]: formattedValue
    });
  };

  // Validação simples dos dados do cartão
  const validarCartao = () => {
    if (pagamentoData.formaPagamento !== 'CARTAO') return true;
    
    const numeroLimpo = pagamentoData.numeroCartao.replace(/\s/g, '');
    return numeroLimpo.length >= 13 && 
           pagamentoData.nomeCartao.length >= 2 && 
           pagamentoData.validadeCartao.length === 5 && 
           pagamentoData.cvvCartao.length >= 3;
  };

  const getTotalComFrete = () => {
    const subtotal = getCartTotal();
    const frete = freteSelecionado ? freteSelecionado.valor : 0;
    return subtotal + frete;
  };

  if (step === 4) {
    const compraData = JSON.parse(localStorage.getItem('ultimaCompra') || '{}');
    
    return (
      <div className="ecommerce-page">
        <EcommerceHeader />
        <div className="auth-container">
          <div className="auth-card success-purchase-card">
            <div className="success-message">
              <div className="success-icon">🎉</div>
              <h2>Compra Realizada com Sucesso!</h2>
              <p className="success-subtitle">Seu pedido foi processado e confirmado</p>
              
              <div className="purchase-details">
                <div className="detail-item">
                  <span className="detail-label">📋 Número do Pedido:</span>
                  <span className="detail-value">{compraData.numeroPedido}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">💰 Valor Total:</span>
                  <span className="detail-value highlight">{formatPrice(compraData.valorTotal)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">💳 Forma de Pagamento:</span>
                  <span className="detail-value">{compraData.formaPagamento}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">🚚 Frete ({compraData.frete?.nome}):</span>
                  <span className="detail-value">
                    {compraData.frete?.valor > 0 ? formatPrice(compraData.frete.valor) : 'Grátis'} 
                    - {compraData.frete?.prazoEntrega} dias úteis
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">📦 Itens:</span>
                  <span className="detail-value">{compraData.itens} produto{compraData.itens > 1 ? 's' : ''}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">📍 Entrega:</span>
                  <span className="detail-value">{compraData.enderecoEntrega}</span>
                </div>
              </div>
              
              <div className="success-actions">
                <button 
                  onClick={() => navigate('/')} 
                  className="btn-primary btn-large"
                >
                  🏠 Voltar ao Início
                </button>
                <button 
                  onClick={() => navigate('/produtos')} 
                  className="btn-secondary btn-large"
                >
                  🛍️ Continuar Comprando
                </button>
              </div>
              
              <p className="success-note">
                🎯 Parabéns! Sua compra foi processada com sucesso. 
                Em breve você receberá os detalhes por email.
              </p>
              
              <div className="auto-redirect-info">
                <p>
                  🕒 Redirecionando automaticamente para a loja em <strong>{countdown}</strong> segundo{countdown !== 1 ? 's' : ''}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ecommerce-page">
      <EcommerceHeader />
      
      <div className="auth-container">
        <div className="auth-card">
          {/* Progress Steps */}
          <div className="checkout-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Endereço</span>
            </div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Frete</span>
            </div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Pagamento</span>
            </div>
          </div>

          {/* Header */}
          <div className="auth-header">
            <h1>Finalizar Compra</h1>
            <p>Passo {step} de 3</p>
          </div>

          {error && (
            <div className="auth-error">
              <div className="error-icon">⚠️</div>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Endereço */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); calcularFrete(); }}>
              <div className="auth-form">
                <h3>Endereço de Entrega</h3>
                
                {/* Seleção de endereços salvos */}
                {enderecosSalvos.length > 0 && !usarNovoEndereco && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ 
                      backgroundColor: '#f0f9ff', 
                      border: '1px solid #0ea5e9', 
                      borderRadius: '8px', 
                      padding: '16px', 
                      marginBottom: '16px' 
                    }}>
                      <h4 style={{ fontSize: '16px', marginBottom: '8px', color: '#0c4a6e' }}>
                        📍 Seus Endereços Salvos
                      </h4>
                      <p style={{ fontSize: '14px', color: '#075985', margin: '0' }}>
                        Selecione um endereço ou cadastre um novo
                      </p>
                    </div>
                    <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#1e293b' }}>
                      Selecione um endereço:
                    </h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {enderecosSalvos.map((endereco) => (
                        <div
                          key={endereco.id}
                          onClick={() => handleSelecionarEndereco(endereco)}
                          style={{
                            border: enderecoSelecionadoId === endereco.id ? '2px solid #FF4F5A' : '1px solid #dee2e6',
                            borderRadius: '8px',
                            padding: '16px',
                            cursor: 'pointer',
                            backgroundColor: enderecoSelecionadoId === endereco.id ? '#fff5f5' : 'white',
                            transition: 'all 0.3s',
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
                              padding: '4px 8px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}>
                              PADRÃO
                            </span>
                          )}
                          {endereco.apelido && (
                            <h5 style={{ margin: '0 0 8px 0', color: '#FF4F5A', fontSize: '14px' }}>
                              📌 {endereco.apelido}
                            </h5>
                          )}
                          <p style={{ margin: '4px 0', fontSize: '13px' }}>
                            <strong>CEP:</strong> {endereco.cep}
                          </p>
                          <p style={{ margin: '4px 0', fontSize: '13px' }}>
                            {endereco.logradouro}, {endereco.numero}
                            {endereco.complemento && ` - ${endereco.complemento}`}
                          </p>
                          <p style={{ margin: '4px 0', fontSize: '13px' }}>
                            {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUsarNovoEndereco(true);
                        setEnderecoSelecionadoId(null);
                        setEnderecoData({
                          cep: '',
                          logradouro: '',
                          numero: '',
                          complemento: '',
                          bairro: '',
                          cidade: '',
                          uf: ''
                        });
                      }}
                      style={{
                        marginTop: '16px',
                        padding: '12px 20px',
                        backgroundColor: '#FF4F5A',
                        border: '1px solid #FF4F5A',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        width: '100%',
                        boxShadow: '0 2px 4px rgba(255, 79, 90, 0.2)'
                      }}
                    >
                      ➕ Cadastrar Novo Endereço
                    </button>
                  </div>
                )}
                
                {/* Botão para voltar aos endereços salvos */}
                {usarNovoEndereco && enderecosSalvos.length > 0 && (
                  <div style={{ 
                    backgroundColor: '#e0f2fe', 
                    border: '1px solid #0284c7', 
                    borderRadius: '8px', 
                    padding: '12px', 
                    marginBottom: '16px' 
                  }}>
                    <p style={{ fontSize: '14px', color: '#0369a1', margin: '0 0 8px 0' }}>
                      💡 Você tem {enderecosSalvos.length} endereço(s) salvo(s) na sua conta
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setUsarNovoEndereco(false);
                        carregarEnderecosSalvos();
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#0284c7',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      ← Voltar para Endereços Salvos
                    </button>
                  </div>
                )}
                
                {/* Mensagem quando não há endereços salvos */}
                {enderecosSalvos.length === 0 && !usarNovoEndereco && (
                  <div style={{ 
                    backgroundColor: '#fef3c7', 
                    border: '1px solid #f59e0b', 
                    borderRadius: '8px', 
                    padding: '16px', 
                    marginBottom: '16px' 
                  }}>
                    <h4 style={{ fontSize: '16px', marginBottom: '8px', color: '#92400e' }}>
                      🏠 Primeiro Endereço de Entrega
                    </h4>
                    <p style={{ fontSize: '14px', color: '#451a03', margin: '0' }}>
                      Cadastre seu primeiro endereço de entrega. Ele será salvo para futuras compras.
                    </p>
                  </div>
                )}
                
                {/* Formulário de endereço (mostrar se não houver endereços salvos OU se optar por usar novo) */}
                {(enderecosSalvos.length === 0 || usarNovoEndereco) && (
                  <>
                
                <div className="form-row">
                  <div className="form-group form-group-small">
                    <label htmlFor="cep">CEP *</label>
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      value={enderecoData.cep}
                      onChange={handleEnderecoChange}
                      required
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="logradouro">Logradouro *</label>
                    <input
                      type="text"
                      id="logradouro"
                      name="logradouro"
                      value={enderecoData.logradouro}
                      onChange={handleEnderecoChange}
                      required
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                </div>
                  </>
                )}
                
                {/* Campos ocultos para endereços selecionados */}
                {enderecoSelecionadoId && !usarNovoEndereco && (
                  <div style={{ display: 'none' }}>
                    <input type="text" name="cep" value={enderecoData.cep} readOnly />
                    <input type="text" name="logradouro" value={enderecoData.logradouro} readOnly />
                    <input type="text" name="numero" value={enderecoData.numero} readOnly />
                    <input type="text" name="bairro" value={enderecoData.bairro} readOnly />
                    <input type="text" name="cidade" value={enderecoData.cidade} readOnly />
                    <input type="text" name="uf" value={enderecoData.uf} readOnly />
                  </div>
                )}

                {(enderecosSalvos.length === 0 || usarNovoEndereco) && (
                  <>
                <div className="form-row">
                  <div className="form-group form-group-small">
                    <label htmlFor="numero">Número *</label>
                    <input
                      type="text"
                      id="numero"
                      name="numero"
                      value={enderecoData.numero}
                      onChange={handleEnderecoChange}
                      required
                      placeholder="123"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="complemento">Complemento</label>
                    <input
                      type="text"
                      id="complemento"
                      name="complemento"
                      value={enderecoData.complemento}
                      onChange={handleEnderecoChange}
                      placeholder="Apto, Bloco..."
                    />
                  </div>
                </div>
                  </>
                )}

                {(enderecosSalvos.length === 0 || usarNovoEndereco) && (
                  <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bairro">Bairro *</label>
                    <input
                      type="text"
                      id="bairro"
                      name="bairro"
                      value={enderecoData.bairro}
                      onChange={handleEnderecoChange}
                      required
                      placeholder="Nome do bairro"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cidade">Cidade *</label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={enderecoData.cidade}
                      onChange={handleEnderecoChange}
                      required
                      placeholder="Nome da cidade"
                    />
                  </div>
                  <div className="form-group form-group-small">
                    <label htmlFor="uf">UF *</label>
                    <select
                      id="uf"
                      name="uf"
                      value={enderecoData.uf}
                      onChange={handleEnderecoChange}
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
                
                {/* Opção para salvar endereço na conta */}
                {usarNovoEndereco && user && (
                  <div style={{ 
                    marginTop: '16px',
                    padding: '12px', 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px' 
                  }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151'
                    }}>
                      <input
                        type="checkbox"
                        checked={salvarNovoEndereco}
                        onChange={(e) => setSalvarNovoEndereco(e.target.checked)}
                        style={{ marginRight: '8px' }}
                      />
                      💾 Salvar este endereço na minha conta para futuras compras
                    </label>
                  </div>
                )}
                  </>
                )}
              </div>

              <div className="checkout-actions">
                <button type="button" onClick={() => navigate('/carrinho')} className="btn-secondary">
                  ← Voltar ao Carrinho
                </button>
                <button type="submit" disabled={loadingFrete} className="btn-primary">
                  {loadingFrete ? '⏳ Calculando...' : 'Calcular Frete →'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Frete */}
          {step === 2 && (
            <div className="auth-form">
              <h3>Opções de Frete</h3>
              
              <div className="frete-options">
                {freteOptions.map((opcao, index) => (
                  <div 
                    key={index} 
                    className={`frete-option ${freteSelecionado?.tipo === opcao.tipo ? 'selected' : ''}`}
                    onClick={() => setFreteSelecionado(opcao)}
                  >
                    <div className="frete-radio">
                      <input
                        type="radio"
                        name="frete"
                        checked={freteSelecionado?.tipo === opcao.tipo}
                        onChange={() => setFreteSelecionado(opcao)}
                      />
                    </div>
                    <div className="frete-info">
                      <div className="frete-nome">{opcao.nome}</div>
                      <div className="frete-prazo">{opcao.prazoEntrega} dias úteis</div>
                      <div className="frete-descricao">{opcao.descricao}</div>
                    </div>
                    <div className="frete-valor">
                      {opcao.valor > 0 ? formatPrice(opcao.valor) : 'Grátis'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <div className="summary-line">
                  <span>Subtotal:</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="summary-line">
                  <span>Frete:</span>
                  <span>{freteSelecionado ? (freteSelecionado.valor > 0 ? formatPrice(freteSelecionado.valor) : 'Grátis') : '-'}</span>
                </div>
                <div className="summary-total">
                  <span>Total:</span>
                  <span>{formatPrice(getTotalComFrete())}</span>
                </div>
              </div>

              <div className="checkout-actions">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                  ← Voltar
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep(3)} 
                  disabled={!freteSelecionado}
                  className="btn-primary"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Pagamento */}
          {step === 3 && (
            <div className="auth-form">
              <h3>Forma de Pagamento</h3>
              
              <div className="form-group">
                <label htmlFor="formaPagamento">Forma de Pagamento *</label>
                <select
                  id="formaPagamento"
                  name="formaPagamento"
                  value={pagamentoData.formaPagamento}
                  onChange={handlePagamentoChange}
                  required
                >
                  <option value="PIX">💳 PIX - Instantâneo</option>
                  <option value="BOLETO">🧾 Boleto Bancário - Vencimento em 3 dias</option>
                  <option value="CARTAO">💳 Cartão de Crédito</option>
                  <option value="SALDO_GOIA">🏦 Saldo em Conta GOIA Bank</option>
                </select>
              </div>

              {/* Campos do Cartão */}
              {pagamentoData.formaPagamento === 'CARTAO' && (
                <div style={{ border: '1px solid #e1e5e9', borderRadius: '8px', padding: '16px', marginBottom: '16px', backgroundColor: '#f8f9fa' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>Dados do Cartão</h4>
                  
                  <div className="form-group">
                    <label htmlFor="numeroCartao">Número do Cartão *</label>
                    <input
                      type="text"
                      id="numeroCartao"
                      name="numeroCartao"
                      value={pagamentoData.numeroCartao}
                      onChange={handlePagamentoChange}
                      placeholder="0000 0000 0000 0000"
                      required
                      maxLength="19"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="nomeCartao">Nome no Cartão *</label>
                    <input
                      type="text"
                      id="nomeCartao"
                      name="nomeCartao"
                      value={pagamentoData.nomeCartao}
                      onChange={handlePagamentoChange}
                      placeholder="NOME COMO IMPRESSO NO CARTÃO"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label htmlFor="validadeCartao">Validade *</label>
                      <input
                        type="text"
                        id="validadeCartao"
                        name="validadeCartao"
                        value={pagamentoData.validadeCartao}
                        onChange={handlePagamentoChange}
                        placeholder="MM/AA"
                        required
                        maxLength="5"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="cvvCartao">CVV *</label>
                      <input
                        type="text"
                        id="cvvCartao"
                        name="cvvCartao"
                        value={pagamentoData.cvvCartao}
                        onChange={handlePagamentoChange}
                        placeholder="000"
                        required
                        maxLength="4"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="parcelasCartao">Parcelas</label>
                      <select
                        id="parcelasCartao"
                        name="parcelasCartao"
                        value={pagamentoData.parcelasCartao}
                        onChange={handlePagamentoChange}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(parcela => {
                          const valorParcela = getTotalComFrete() / parcela;
                          return (
                            <option key={parcela} value={parcela}>
                              {parcela}x {formatPrice(valorParcela)}
                              {parcela === 1 ? ' (à vista)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Informações do Boleto */}
              {pagamentoData.formaPagamento === 'BOLETO' && (
                <div style={{ border: '1px solid #fbbf24', borderRadius: '8px', padding: '16px', marginBottom: '16px', backgroundColor: '#fefce8' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#92400e' }}>ℹ️ Informações do Boleto</h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#451a03' }}>
                    • O boleto será gerado após a confirmação do pedido<br/>
                    • Vencimento em 3 dias úteis<br/>
                    • Após o pagamento, o pedido será processado em até 2 dias úteis
                  </p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="observacoes">Observações</label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={pagamentoData.observacoes}
                  onChange={handlePagamentoChange}
                  placeholder="Observações para o pedido (opcional)"
                  rows={3}
                />
              </div>

              <div className="order-summary">
                <div className="summary-line">
                  <span>Subtotal:</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="summary-line">
                  <span>Frete ({freteSelecionado?.nome}):</span>
                  <span>{freteSelecionado.valor > 0 ? formatPrice(freteSelecionado.valor) : 'Grátis'}</span>
                </div>
                <div className="summary-total">
                  <span>Total:</span>
                  <span>{formatPrice(getTotalComFrete())}</span>
                </div>
                {pagamentoData.formaPagamento === 'CARTAO' && pagamentoData.parcelasCartao > 1 && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    💳 {pagamentoData.parcelasCartao}x de {formatPrice(getTotalComFrete() / pagamentoData.parcelasCartao)} 
                  </div>
                )}
              </div>

              <div className="checkout-actions">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                  ← Voltar
                </button>
                <button 
                  type="button" 
                  onClick={finalizarPedido} 
                  disabled={loading || (pagamentoData.formaPagamento === 'CARTAO' && !validarCartao())}
                  className="btn-primary"
                >
                  {loading ? '⏳ Finalizando...' : (user ? '✨ Finalizar Pedido' : '🔐 Login e Finalizar')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;