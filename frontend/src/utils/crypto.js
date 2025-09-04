/**
 * Utilitário para criptografia de senhas
 * Implementa SHA-256 conforme especificação do sistema
 */

/**
 * Aplica hash SHA-256 em uma string
 * @param {string} text - Texto a ser hasheado
 * @returns {Promise<string>} - Hash SHA-256 em hexadecimal
 */
export async function hashSHA256(text) {
    try {
        // Converte a string para bytes usando TextEncoder
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        
        // Aplica SHA-256 usando Web Crypto API
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        
        // Converte o buffer de bytes para array
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        
        // Converte cada byte para hexadecimal e junta
        const hashHex = hashArray
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
        
        return hashHex;
    } catch (error) {
        console.error('Erro ao aplicar SHA-256:', error);
        throw new Error('Erro na criptografia da senha');
    }
}

/**
 * Valida se o ambiente suporta Web Crypto API
 * @returns {boolean} - True se suportar, false caso contrário
 */
export function isWebCryptoSupported() {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined' && 
           typeof crypto.subtle.digest === 'function';
}

/**
 * Aplica SHA-256 com fallback para ambientes que não suportam Web Crypto
 * @param {string} text - Texto a ser hasheado
 * @returns {Promise<string>} - Hash SHA-256 em hexadecimal
 */
export async function hashPassword(text) {
    if (isWebCryptoSupported()) {
        return await hashSHA256(text);
    } else {
        // Fallback para desenvolvimento/testes (não usar em produção)
        console.warn('Web Crypto API não disponível, usando fallback inseguro');
        return simpleHashFallback(text);
    }
}

/**
 * Fallback simples para desenvolvimento (INSEGURO - não usar em produção)
 * @param {string} text - Texto a ser "hasheado"
 * @returns {string} - Hash simulado
 */
function simpleHashFallback(text) {
    // Este é apenas um fallback para desenvolvimento
    // Em produção, deve-se garantir que Web Crypto API esteja disponível
    let hash = 0;
    if (text.length === 0) return hash.toString();
    
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0');
}
