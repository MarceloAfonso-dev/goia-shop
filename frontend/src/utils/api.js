import axios from 'axios';

// Configuração base da API
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar respostas de erro
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirecionar para login se não estiver na tela de login
            if (window.location.pathname !== '/') {
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);

export default api;
