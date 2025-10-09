import { useState, useEffect, useContext, createContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Carregar carrinho do localStorage
    const savedCart = localStorage.getItem('goia-shop-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [cartCount, setCartCount] = useState(0);

  // Atualizar localStorage sempre que o carrinho mudar
  useEffect(() => {
    localStorage.setItem('goia-shop-cart', JSON.stringify(cart));
    
    // Calcular total de itens no carrinho
    const totalItems = cart.reduce((sum, item) => sum + item.quantidade, 0);
    setCartCount(totalItems);
  }, [cart]);

  // Adicionar produto ao carrinho
  const addToCart = (produto, quantidade = 1) => {
    setCart(prevCart => {
      // Verificar se o produto já está no carrinho
      const existingItemIndex = prevCart.findIndex(item => item.id === produto.id);
      
      if (existingItemIndex >= 0) {
        // Se já existe, atualizar quantidade
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantidade += quantidade;
        return newCart;
      } else {
        // Se não existe, adicionar novo item
        return [...prevCart, {
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          imagem: produto.imagens?.[0]?.caminho || null,
          quantidade: quantidade,
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

    setCart(prevCart => 
      prevCart.map(item => 
        item.id === produtoId 
          ? { ...item, quantidade: novaQuantidade }
          : item
      )
    );
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


