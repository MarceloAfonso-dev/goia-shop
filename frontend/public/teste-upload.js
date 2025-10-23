// Teste simples para verificar upload de imagem
async function testarUploadImagem() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    console.log('=== TESTE DE UPLOAD ===');
    console.log('Token:', token ? 'Presente' : 'Ausente');
    console.log('UserType:', userType);
    
    if (!token) {
        console.error('❌ Usuário não está logado');
        return;
    }
    
    // Primeiro, testar se conseguimos criar um produto simples
    try {
        const produtoResponse = await fetch('http://localhost:8080/api/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome: 'Produto Teste',
                descricao: 'Teste de upload',
                preco: 10.99,
                quantidadeEstoque: 1,
                status: 'ATIVO'
            })
        });
        
        if (!produtoResponse.ok) {
            console.error('❌ Erro ao criar produto:', await produtoResponse.text());
            return;
        }
        
        const produto = await produtoResponse.json();
        console.log('✅ Produto criado:', produto);
        
        // Agora testar se podemos verificar nossa role
        const profileResponse = await fetch('http://localhost:8080/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (profileResponse.ok) {
            const profile = await profileResponse.json();
            console.log('✅ Profile do usuário:', profile);
        } else {
            console.error('❌ Erro ao buscar profile:', await profileResponse.text());
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Teste específico para validação de estoque
async function testarEstoqueZero() {
    const token = localStorage.getItem('token');
    
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
        } else {
            console.error('❌ Erro ao criar produto com estoque 0:', await response.text());
        }
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Execute o teste no console do navegador
console.log('Para testar upload: testarUploadImagem()');
console.log('Para testar estoque zero: testarEstoqueZero()');
