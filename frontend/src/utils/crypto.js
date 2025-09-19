/**
 * Gera hash SHA-256 de uma senha usando Web Crypto API
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} - Hash SHA-256 em formato hexadecimal
 */
export async function hashPassword(password) {
    try {
        // Verifica se Web Crypto API está disponível
        if (!crypto || !crypto.subtle) {
            throw new Error('Web Crypto API não está disponível neste navegador');
        }

        // Converte a string em array de bytes
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        
        // Gera o hash SHA-256
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        
        // Converte o buffer para string hexadecimal
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    } catch (error) {
        console.error('Erro na criptografia da senha:', error);
        throw new Error('Erro na criptografia da senha');
    }
}

/**
 * Verifica se o Web Crypto está disponível
 * @returns {boolean} - True se Web Crypto estiver disponível
 */
export function isWebCryptoAvailable() {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined' &&
           typeof crypto.subtle.digest === 'function';
}

/**
 * Valida se um CPF é válido usando o algoritmo oficial
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {boolean} - True se o CPF for válido
 */
export function validarCPF(cpf) {
    // Remove formatação (pontos, traços, espaços)
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
        return false;
    }
    
    // Verifica se todos os dígitos são iguais (CPFs inválidos como 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
        return false;
    }
    
    // Calcula o primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    
    // Verifica o primeiro dígito
    if (parseInt(cpfLimpo.charAt(9)) !== digito1) {
        return false;
    }
    
    // Calcula o segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    
    // Verifica o segundo dígito
    if (parseInt(cpfLimpo.charAt(10)) !== digito2) {
        return false;
    }
    
    return true;
}