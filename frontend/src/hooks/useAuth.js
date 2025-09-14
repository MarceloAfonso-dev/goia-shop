import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar se há usuário logado no localStorage
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        console.log('useAuth - verificando localStorage:', { savedUser: !!savedUser, token: !!token });
        
        if (savedUser && token) {
            try {
                const userData = JSON.parse(savedUser);
                console.log('useAuth - restaurando usuário:', userData);
                setUser(userData);
            } catch (e) {
                console.error('Erro ao parsear dados do usuário:', e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        
        setLoading(false);
    }, []);

    const login = (userData) => {
        console.log('useAuth - fazendo login:', userData);
        setUser(userData);
        // Garantir que os dados sejam salvos no localStorage
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        console.log('useAuth - fazendo logout');
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isAuthenticated = () => {
        const result = user !== null;
        console.log('useAuth - isAuthenticated:', result);
        return result;
    };

    const isAdmin = () => {
        return user?.grupo === 'ADMIN';
    };

    const isEstoquista = () => {
        return user?.grupo === 'ESTOQUISTA';
    };

    return {
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isEstoquista
    };
};
