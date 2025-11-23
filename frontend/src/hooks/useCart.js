import { useState, useEffect, useContext, createContext, useRef } from 'react';
import Toast from '../components/Toast';

const CartContext = createContext();

// Função para gerar UUID único
const generateCartToken = () => {
  return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const CartProvider = ({ children }) => {
  // Função para obter identificador único do carrinho
  const getCartIdentifier = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.id) {
      return `user_${user.id}`;
    } else {
      // Para usuários anônimos, usar cart_token
      let token = localStorage.getItem('goia-shop-cart-token');
      if (!token) {
        token = generateCartToken();
        localStorage.setItem('goia-shop-cart-token', token);
      }
      return `anon_${token}`;
    }
  };

  const [cartIdentifier, setCartIdentifier] = useState(getCartIdentifier());

  const [cart, setCart] = useState(() => {
    // Carregar carrinho específico do usuário/sessão
    const identifier = getCartIdentifier();
    const savedCart = localStorage.getItem(`goia-shop-cart-${identifier}`);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [cartToken, setCartToken] = useState(() => {
    // Carregar ou gerar cart_token apenas para anônimos
    let token = localStorage.getItem('goia-shop-cart-token');
    if (!token) {
      token = generateCartToken();
      localStorage.setItem('goia-shop-cart-token', token);
    }
    return token;
  });

  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState(null);
  const processingRef = useRef(false);

  // Detectar mudanças de usuário (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const newIdentifier = getCartIdentifier();
      if (newIdentifier !== cartIdentifier) {
        console.log('🔄 Usuário mudou:', cartIdentifier, '->', newIdentifier);
        setCartIdentifier(newIdentifier);
        const savedCart = localStorage.getItem(`goia-shop-cart-${newIdentifier}`);
        const newCart = savedCart ? JSON.parse(savedCart) : [];
        console.log('📦 Carregando carrinho para novo usuário:', newCart);
        setCart(newCart);
      }
    };

    // Escutar mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Verificar mudança na primeira renderização
    handleStorageChange();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [cartIdentifier]);

  // Atualizar localStorage sempre que o carrinho mudar
  useEffect(() => {
    // Salvar carrinho com identificador específico
    localStorage.setItem(`goia-shop-cart-${cartIdentifier}`, JSON.stringify(cart));
    
    // Calcular total de itens no carrinho
    const totalItems = cart.reduce((sum, item) => sum + item.quantidade, 0);
    setCartCount(totalItems);
  }, [cart, cartIdentifier]);

  // Função auxiliar para mostrar toast
  const showToast = (message, type = 'info') => {
    console.log('🔔 showToast chamado:', { message, type });
    setToast({ message, type });
  };

  // Adicionar produto ao carrinho
  const addToCart = (produto, quantidade = 1) => {
    // Prevenir chamadas duplicadas usando useRef (mais confiável que useState)
    if (processingRef.current) {
      console.log('⏸️ Bloqueado: addToCart já está processando');
      return;
    }
    
    console.log('✅ Processando addToCart para:', produto.nome, 'quantidade:', quantidade);
    processingRef.current = true;
    
    // Verificar se há estoque disponível
    const estoqueDisponivel = produto.quantidade || 0;
    
    // Usar a abordagem de callback para garantir que usamos o estado mais recente
    setCart(prevCart => {
      console.log('🛒 Estado atual do carrinho:', prevCart.map(i => `${i.nome}: ${i.quantidade}`));
      
      // Verificar se o produto já está no carrinho
      const existingItem = prevCart.find(item => item.id === produto.id);
      
      if (existingItem) {
        // Se já existe, verificar se pode adicionar mais
        const quantidadeAtual = existingItem.quantidade;
        const novaQuantidade = quantidadeAtual + quantidade;
        
        console.log(`📦 Produto existe. Atual: ${quantidadeAtual}, Nova: ${novaQuantidade}, Estoque: ${estoqueDisponivel}`);
        
        // Validar estoque
        if (novaQuantidade > estoqueDisponivel) {
          showToast(
            `Estoque insuficiente! Disponível: ${estoqueDisponivel} ${estoqueDisponivel === 1 ? 'unidade' : 'unidades'}. Você já tem ${quantidadeAtual} no carrinho.`,
            'warning'
          );
          setTimeout(() => { processingRef.current = false; }, 500);
          return prevCart; // Não modifica o carrinho
        }
        
        // Atualizar quantidade
        showToast(`${produto.nome} - Quantidade atualizada no carrinho! (${novaQuantidade})`, 'success');
        setTimeout(() => { processingRef.current = false; }, 500);
        
        return prevCart.map(item => 
          item.id === produto.id 
            ? { 
                ...item, 
                quantidade: novaQuantidade,
                produtoCompleto: produto 
              }
            : item
        );
      } else {
        // Se não existe, verificar estoque antes de adicionar
        console.log(`🆕 Produto novo. Quantidade: ${quantidade}, Estoque: ${estoqueDisponivel}`);
        
        if (quantidade > estoqueDisponivel) {
          showToast(
            `Estoque insuficiente! Disponível: ${estoqueDisponivel} ${estoqueDisponivel === 1 ? 'unidade' : 'unidades'}.`,
            'error'
          );
          setTimeout(() => { processingRef.current = false; }, 500);
          return prevCart; // Não adiciona ao carrinho
        }
        
        // Adicionar novo item
        showToast(`${produto.nome} adicionado ao carrinho!`, 'success');
        setTimeout(() => { processingRef.current = false; }, 500);
        
        return [...prevCart, {
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          imagem: produto.imagens?.[0]?.caminho || null,
          quantidade: quantidade,
          estoqueDisponivel: estoqueDisponivel,
          produtoCompleto: produto
        }];
      }
    });
  };

  // Remover produto do carrinho
  const removeFromCart = (produtoId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== produtoId));
  };

  // Atualizar quantidade de um item no carrinho
  const updateQuantity = (produtoId, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removeFromCart(produtoId);
      return;
    }

    setCart(prevCart => {
      const item = prevCart.find(item => item.id === produtoId);
      if (!item) return prevCart;
      
      // Verificar estoque disponível
      const estoqueDisponivel = item.produtoCompleto?.quantidade || item.estoqueDisponivel || 0;
      
      if (novaQuantidade > estoqueDisponivel) {
        showToast(
          `Estoque insuficiente! Disponível: ${estoqueDisponivel} ${estoqueDisponivel === 1 ? 'unidade' : 'unidades'}.`,
          'warning'
        );
        return prevCart; // Não modifica
      }
      
      showToast(`Quantidade atualizada!`, 'info');
      return prevCart.map(item => 
        item.id === produtoId 
          ? { ...item, quantidade: novaQuantidade }
          : item
      );
    });
  };

  // Limpar carrinho
  const clearCart = () => {
    setCart([]);
  };

  // Calcular total do carrinho
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  // Verificar se produto está no carrinho
  const isInCart = (produtoId) => {
    return cart.some(item => item.id === produtoId);
  };

  // Obter quantidade de um produto no carrinho
  const getProductQuantity = (produtoId) => {
    const item = cart.find(item => item.id === produtoId);
    return item ? item.quantidade : 0;
  };

  // Função para preservar carrinho com token
  const preserveCartWithToken = () => {
    if (cart.length > 0) {
      localStorage.setItem('goia-shop-cart-preserved', JSON.stringify({
        cart,
        token: cartToken,
        timestamp: Date.now()
      }));
    }
  };

  // Função para restaurar carrinho preservado
  const restorePreservedCart = () => {
    const preserved = localStorage.getItem('goia-shop-cart-preserved');
    if (preserved) {
      try {
        const { cart: preservedCart, token, timestamp } = JSON.parse(preserved);
        // Verificar se não expirou (24 horas)
        const isExpired = (Date.now() - timestamp) > (24 * 60 * 60 * 1000);
        
        if (!isExpired && preservedCart && preservedCart.length > 0) {
          // Substituir carrinho atual pelo preservado (não fazer merge)
          console.log('🔄 Restaurando carrinho preservado:', preservedCart);
          setCart(preservedCart);
          setCartToken(token);
          localStorage.setItem('goia-shop-cart-token', token);
          
          // Limpar carrinho preservado após restaurar
          localStorage.removeItem('goia-shop-cart-preserved');
          
          showToast('Carrinho restaurado com sucesso!', 'success');
          return true;
        }
      } catch (error) {
        console.error('Erro ao restaurar carrinho:', error);
      }
      
      // Limpar se expirado ou com erro
      localStorage.removeItem('goia-shop-cart-preserved');
    }
    return false;
  };

  // Função para limpar carrinho e gerar novo token
  const clearCartAndToken = () => {
    setCart([]);
    
    // Limpar carrinho específico do identificador atual
    localStorage.removeItem(`goia-shop-cart-${cartIdentifier}`);
    
    // Se for usuário anônimo, gerar novo token
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || !user.id) {
      const newToken = generateCartToken();
      setCartToken(newToken);
      localStorage.setItem('goia-shop-cart-token', newToken);
      setCartIdentifier(`anon_${newToken}`);
    }
    
    localStorage.removeItem('goia-shop-cart-preserved');
  };

  // Função para limpar carrinho no logout (sem gerar novo token)
  const clearCartOnLogout = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUser && currentUser.id) {
      // Limpar carrinho específico do usuário que está fazendo logout
      localStorage.removeItem(`goia-shop-cart-user_${currentUser.id}`);
      setCart([]);
      
      // Resetar para modo anônimo
      const newIdentifier = getCartIdentifier();
      setCartIdentifier(newIdentifier);
      
      // Carregar carrinho anônimo se existir
      const anonCart = localStorage.getItem(`goia-shop-cart-${newIdentifier}`);
      setCart(anonCart ? JSON.parse(anonCart) : []);
    }
  };

  // Função para trocar para o carrinho do usuário após login
  const switchToUserCart = () => {
    console.log('🔄 switchToUserCart chamado');
    const newIdentifier = getCartIdentifier();
    console.log('🆔 Novo identificador:', newIdentifier);
    
    if (newIdentifier !== cartIdentifier) {
      setCartIdentifier(newIdentifier);
      const savedCart = localStorage.getItem(`goia-shop-cart-${newIdentifier}`);
      const userCart = savedCart ? JSON.parse(savedCart) : [];
      console.log('📦 Carregando carrinho do usuário:', userCart);
      setCart(userCart);
    }
  };

  const value = {
    cart,
    cartCount,
    cartToken,
    cartIdentifier,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    isInCart,
    getProductQuantity,
    preserveCartWithToken,
    restorePreservedCart,
    clearCartAndToken,
    clearCartOnLogout,
    switchToUserCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};


