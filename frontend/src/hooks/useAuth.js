import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar se há usuário logado no localStorage
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
        
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isAuthenticated = () => {
        return user !== null;
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
