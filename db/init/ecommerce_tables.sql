-- Script SQL para adicionar tabelas de e-commerce ao GOIA Shop
-- Execute este script no seu banco MySQL

USE goia_shop;

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    data_nascimento DATE,
    senha_hash VARCHAR(255) NOT NULL,
    
    -- Endereço principal
    cep VARCHAR(9),
    logradouro VARCHAR(200),
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    status ENUM('ATIVO', 'INATIVO', 'BLOQUEADO') NOT NULL DEFAULT 'ATIVO',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    
    INDEX idx_cliente_email (email),
    INDEX idx_cliente_cpf (cpf),
    INDEX idx_cliente_status (status)
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    numero_pedido VARCHAR(20) NOT NULL UNIQUE,
    status ENUM('PENDENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
    valor_total DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    forma_pagamento VARCHAR(50),
    
    -- Endereço de entrega
    entrega_cep VARCHAR(9),
    entrega_logradouro VARCHAR(200),
    entrega_numero VARCHAR(10),
    entrega_complemento VARCHAR(100),
    entrega_bairro VARCHAR(100),
    entrega_cidade VARCHAR(100),
    entrega_estado VARCHAR(2),
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    INDEX idx_pedido_cliente (cliente_id),
    INDEX idx_pedido_status (status),
    INDEX idx_pedido_numero (numero_pedido),
    INDEX idx_pedido_created (created_at)
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    produto_id BIGINT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    preco_total DECIMAL(10,2) NOT NULL,
    
    -- Dados do produto no momento da compra (para histórico)
    produto_nome VARCHAR(200) NOT NULL,
    produto_descricao TEXT,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos_ecommerce(id),
    INDEX idx_pedido_item_pedido (pedido_id),
    INDEX idx_pedido_item_produto (produto_id)
);

-- Tabela de endereços de entrega dos clientes
CREATE TABLE IF NOT EXISTS enderecos_entrega (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    cep VARCHAR(8) NOT NULL,
    logradouro VARCHAR(200) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    is_padrao BOOLEAN NOT NULL DEFAULT FALSE,
    apelido VARCHAR(50), -- Ex: "Casa", "Trabalho", "Casa da Mãe"
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_endereco_cliente (cliente_id),
    INDEX idx_endereco_padrao (cliente_id, is_padrao)
);

-- Inserir alguns clientes de exemplo
INSERT INTO clientes (nome, email, cpf, telefone, data_nascimento, senha_hash, cep, logradouro, numero, bairro, cidade, estado) VALUES
('João Silva', 'joao.silva@email.com', '12345678901', '(11) 99999-9999', '1990-01-15', '$2a$10$example_hash_here', '01310-100', 'Av. Paulista', '100', 'Bela Vista', 'São Paulo', 'SP'),
('Maria Santos', 'maria.santos@email.com', '98765432109', '(11) 88888-8888', '1985-03-22', '$2a$10$example_hash_here', '04038-001', 'Rua Augusta', '200', 'Consolação', 'São Paulo', 'SP');

-- Inserir alguns pedidos de exemplo (opcional)
-- INSERT INTO pedidos (cliente_id, numero_pedido, valor_total, forma_pagamento, entrega_cep, entrega_logradouro, entrega_numero, entrega_bairro, entrega_cidade, entrega_estado) VALUES
-- (1, 'PED1703847293456', 199.99, 'PIX', '01310-100', 'Av. Paulista', '100', 'Bela Vista', 'São Paulo', 'SP');

-- Trigger para atualizar updated_at automaticamente
DELIMITER $$

CREATE TRIGGER update_clientes_timestamp 
    BEFORE UPDATE ON clientes 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER update_pedidos_timestamp 
    BEFORE UPDATE ON pedidos 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER update_enderecos_entrega_timestamp 
    BEFORE UPDATE ON enderecos_entrega 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

-- Verificar se as tabelas foram criadas
SHOW TABLES LIKE '%cliente%';
SHOW TABLES LIKE '%pedido%';

-- Verificar estrutura das tabelas
-- DESCRIBE clientes;
-- DESCRIBE pedidos;
-- DESCRIBE pedido_itens;
