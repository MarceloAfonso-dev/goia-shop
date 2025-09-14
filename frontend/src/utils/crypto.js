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
