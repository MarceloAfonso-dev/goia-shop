/**
 * Utilitário para senhas
 * Agora envia senhas em texto puro para o backend (que usa BCrypt)
 */

/**
 * Retorna a senha em texto puro (sem criptografia)
 * @param {string} password - Senha em texto puro
 * @returns {Promise<string>} - Senha em texto puro
 */
export async function hashPassword(password) {
    // Agora não fazemos criptografia no frontend
    // O backend usa BCrypt diretamente na senha em texto puro
    return password;
}
