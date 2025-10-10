// 🧪 TESTES COMPLETOS - Cole no console do navegador (F12)

// Teste 1: Validação de estoque zero
async function testarEstoqueZero() {
    const token = localStorage.getItem('token');
    console.log('🧪 === TESTE ESTOQUE ZERO ===');
    
    if (!token) {
        console.error('❌ Usuário não está logado');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8080/api/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome: 'Teste Estoque Zero',
                descricao: 'Testando se aceita estoque 0',
                preco: 10.99,
                quantidadeEstoque: 0,  // <- ZERO para admin
                status: 'ATIVO'
            })
        });
        
        if (response.ok) {
            const produto = await response.json();
            console.log('✅ Produto com estoque 0 criado com sucesso:', produto);
            return produto;
        } else {
            const erro = await response.text();
            console.error('❌ Erro ao criar produto com estoque 0:', erro);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        return null;
    }
}

// Teste 2: Upload de imagem
async function testarUploadCompleto() {
    const token = localStorage.getItem('token');
    console.log('🧪 === TESTE UPLOAD COMPLETO ===');
    
    if (!token) {
        console.error('❌ Usuário não está logado');
        return;
    }
    
    try {
        // 1. Criar produto
        console.log('1️⃣ Criando produto...');
        const produtoResponse = await fetch('http://localhost:8080/api/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome: 'Produto Teste Upload',
                descricao: 'Teste completo de upload',
                preco: 15.99,
                quantidadeEstoque: 0,  // Admin sempre 0
                status: 'ATIVO'
            })
        });
        
        if (!produtoResponse.ok) {
            console.error('❌ Erro ao criar produto:', await produtoResponse.text());
            return;
        }
        
        const produto = await produtoResponse.json();
        console.log('✅ Produto criado:', produto);
        
        // 2. Simular upload (você precisará adicionar uma imagem real)
        console.log('2️⃣ Para testar upload, você precisa:');
        console.log('   - Usar a interface web para selecionar uma imagem');
        console.log('   - Os logs detalhados mostrarão o que acontece');
        
        return produto;
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        return null;
    }
}

// Teste 3: Verificar perfil do usuário
async function testarPerfil() {
    const token = localStorage.getItem('token');
    console.log('🧪 === TESTE PERFIL ===');
    
    if (!token) {
        console.error('❌ Usuário não está logado');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8080/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const profile = await response.json();
            console.log('✅ Profile do usuário:', profile);
            console.log('👤 Grupo:', profile.grupo);
            console.log('🏷️ É Admin?', profile.grupo === 'ADMIN');
            return profile;
        } else {
            console.error('❌ Erro ao buscar profile:', await response.text());
            return null;
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        return null;
    }
}

// Executar todos os testes
async function executarTodosTestes() {
    console.log('🚀 === EXECUTANDO TODOS OS TESTES ===\n');
    
    const perfil = await testarPerfil();
    console.log('\n' + '='.repeat(50) + '\n');
    
    const estoque = await testarEstoqueZero();
    console.log('\n' + '='.repeat(50) + '\n');
    
    const upload = await testarUploadCompleto();
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('🏁 === RESUMO ===');
    console.log('✅ Perfil:', perfil ? 'OK' : 'FALHOU');
    console.log('✅ Estoque Zero:', estoque ? 'OK' : 'FALHOU');
    console.log('✅ Produto Criado:', upload ? 'OK' : 'FALHOU');
    
    if (perfil && estoque && upload) {
        console.log('🎉 Todos os testes passaram! O sistema está funcionando.');
        console.log('📝 Agora teste o upload de imagem pela interface web.');
    }
}

console.log('🧪 FUNÇÕES DE TESTE CARREGADAS:');
console.log('- testarEstoqueZero()');
console.log('- testarUploadCompleto()');  
console.log('- testarPerfil()');
console.log('- executarTodosTestes()');
console.log('\n🚀 Execute: executarTodosTestes()');
