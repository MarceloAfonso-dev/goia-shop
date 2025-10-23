import { useState, useEffect, useContext, createContext, useRef } from 'react';
import Toast from '../components/Toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Carregar carrinho do localStorage
    const savedCart = localStorage.getItem('goia-shop-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState(null);
  const processingRef = useRef(false);

  // Atualizar localStorage sempre que o carrinho mudar
  useEffect(() => {
    localStorage.setItem('goia-shop-cart', JSON.stringify(cart));
    
    // Calcular total de itens no carrinho
    const totalItems = cart.reduce((sum, item) => sum + item.quantidade, 0);
    setCartCount(totalItems);
  }, [cart]);

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

  const value = {
    cart,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    isInCart,
    getProductQuantity
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


