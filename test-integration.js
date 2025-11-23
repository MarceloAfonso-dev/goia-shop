// Script de teste para verificar integração
const axios = require('axios');

async function testIntegration() {
    try {
        // 1. Login
        console.log('1. Testando login...');
        const loginResponse = await axios.post('http://localhost:8080/api/auth/login-cliente', {
            email: 'bruce@gmail.com',
            senha: '123456'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login OK - Token:', token.substring(0, 20) + '...');
        
        const headers = { Authorization: `Bearer ${token}` };
        
        // 2. Listar pedidos
        console.log('\n2. Testando listagem de pedidos...');
        const pedidosResponse = await axios.get('http://localhost:8080/api/pedidos', { headers });
        console.log('✅ Pedidos OK - Quantidade:', pedidosResponse.data.length);
        
        // 3. Listar endereços
        console.log('\n3. Testando listagem de endereços...');
        const enderecosResponse = await axios.get('http://localhost:8080/api/enderecos', { headers });
        console.log('✅ Endereços OK - Quantidade:', enderecosResponse.data.enderecos?.length || 0);
        
        // 4. Obter perfil
        console.log('\n4. Testando perfil do cliente...');
        const perfilResponse = await axios.get('http://localhost:8080/api/cliente/perfil', { headers });
        console.log('✅ Perfil OK - Nome:', perfilResponse.data.cliente?.nome);
        
        // 5. Testar update de perfil
        console.log('\n5. Testando atualização de perfil...');
        const updateResponse = await axios.put('http://localhost:8080/api/cliente/perfil', {
            nome: 'Bruce Wayne Updated',
            telefone: '(11) 99999-9999'
        }, { headers });
        console.log('✅ Update Perfil OK');
        
        console.log('\n🎉 TODOS OS TESTES PASSARAM! Backend está funcionando corretamente.');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
    }
}

testIntegration();