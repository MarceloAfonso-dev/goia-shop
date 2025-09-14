CREATE DATABASE IF NOT EXISTS BancoGOIA;
USE BancoGOIA;

-- ========================================
-- TABELAS DO E-COMMERCE GOIA SHOP
-- ========================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cpf CHAR(11) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha_hash VARCHAR(100) NOT NULL,
    grupo ENUM('ADMIN','ESTOQUISTA') NOT NULL,
    status ENUM('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cpf (cpf)
);

-- Nota: Sistema usa JWT stateless, não precisa de tabela de sessões

-- Tabela de produtos do e-commerce
CREATE TABLE produtos_ecommerce (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    quantidade_estoque INT NOT NULL DEFAULT 0,
    avaliacao DECIMAL(2,1) DEFAULT NULL COMMENT 'Avaliação de 1-5 passo 0.5',
    status ENUM('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_by BIGINT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Tabela de imagens dos produtos
CREATE TABLE produto_imagens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    produto_id BIGINT NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    url_arquivo VARCHAR(500) NOT NULL,
    is_principal BOOLEAN NOT NULL DEFAULT FALSE,
    ordem INT NOT NULL DEFAULT 0,
    tamanho_arquivo BIGINT,
    tipo_mime VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos_ecommerce(id) ON DELETE CASCADE
);

-- Tabela de logs de auditoria (para rastrear alterações)
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id BIGINT NOT NULL,
    changes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índices para otimização de consultas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_grupo ON users(grupo);
CREATE INDEX idx_produtos_status ON produtos_ecommerce(status);
CREATE INDEX idx_produto_imagens_produto ON produto_imagens(produto_id);
CREATE INDEX idx_produto_imagens_principal ON produto_imagens(is_principal);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ========================================
-- DADOS DE TESTE PARA DESENVOLVIMENTO
-- ========================================

-- Usuários serão criados automaticamente pelo DataInitializer.java
-- admin@goiashop.com / adm123 (ADMIN)
-- estoquista@goiashop.com / estoque123 (ESTOQUISTA)

-- Produtos de exemplo (criados após os usuários via foreign key)
-- Note: Os produtos serão inseridos pelo DataInitializer também
