CREATE DATABASE IF NOT EXISTS BancoGOIA;
USE BancoGOIA;

CREATE TABLE Instituicao (
    ID_instituicao INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Razao_Social VARCHAR(100) NOT NULL UNIQUE,
    CNPJ VARCHAR(14) NOT NULL UNIQUE,
    CEP VARCHAR(8) NOT NULL
);

CREATE TABLE Cliente (
    ID INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    Nome VARCHAR(100) NOT NULL,
    Sobrenome VARCHAR(250) NOT NULL,
    CPF VARCHAR(11) NOT NULL UNIQUE,  
    Telefone VARCHAR(11) NOT NULL,
    CEP VARCHAR(8) NOT NULL,
    Data_Nascimento DATE NOT NULL
);

CREATE TABLE Conta (
    IdConta INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ID_Cliente INTEGER NOT NULL,  
    Numero_Conta VARCHAR(10) NOT NULL UNIQUE,
    Senha VARCHAR(8) NOT NULL,
    Saldo DECIMAL(14,2) NOT NULL,
    Limite_Credito DECIMAL(14,2) NOT NULL,
    Data_Criacao DATE NOT NULL,
    FOREIGN KEY (ID_Cliente) REFERENCES Cliente(ID) ON DELETE CASCADE  
);

CREATE TABLE Pagamento (
    Id_Pagamento INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Conta INTEGER NOT NULL,
    Tipo_Pagamento ENUM('Boleto', 'Fatura Cartão', 'Tributo', 'Transferência', 'Aporte', 'Outro') NOT NULL,
    Id_Referencia INTEGER, 
    Valor DECIMAL(14,2) NOT NULL,
    Data_Pagamento DATE NOT NULL,
    Status ENUM('pendente', 'concluído', 'cancelado') DEFAULT 'concluído',
    Descricao VARCHAR(200),
    FOREIGN KEY (Id_Conta) REFERENCES Conta(IdConta) ON DELETE CASCADE
);

CREATE TABLE Produtos (
    ID_Produto INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Conta INTEGER NOT NULL,
    Servico ENUM('Cheque Especial', 'Cartão de Crédito', 'CDB') NOT NULL UNIQUE,
    FOREIGN KEY (Id_Conta) REFERENCES Conta(IdConta) ON DELETE CASCADE
);

CREATE TABLE Cheque_Especial (
    Id_Cheque INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Conta INTEGER NOT NULL,
    Valor DECIMAL(14,2) NOT NULL,
    Limite_Cheque DECIMAL(14,2) NOT NULL,
    Subtotal DECIMAL(14,2),
    Situacao_Pagamento ENUM('pendente', 'aprovado', 'cancelado') DEFAULT 'aprovado',
    FOREIGN KEY (Id_Conta) REFERENCES Conta(IdConta) ON DELETE CASCADE
);

CREATE TABLE Cartao_Credito (
    Id_Cartao INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Conta INTEGER NOT NULL,
    Valor_Utilizado DECIMAL(14,2) NOT NULL,
    Limite DECIMAL(14,2) NOT NULL,
    Status_Bloqueio BOOLEAN DEFAULT FALSE,
    Status_Cartao ENUM('ativo', 'inativo', 'bloqueado') NOT NULL,
    FOREIGN KEY (Id_Conta) REFERENCES Conta(IdConta) ON DELETE CASCADE
);

CREATE TABLE Fatura_Cartao (
    ID_Fatura INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Cartao INTEGER NOT NULL,
    Competencia DATE NOT NULL,
    Data_Pagamento DATE NOT NULL,
    Vencimento DATE NOT NULL,
    Valor DECIMAL(14,2),
    Forma_Pagamento ENUM('Saldo em conta') NOT NULL UNIQUE,
    Subtotal DECIMAL(14,2),
    Status ENUM('Pago', 'Pendente', 'Vencido') NOT NULL,
    Valor_Pago DECIMAL(14,2) NOT NULL,
    FOREIGN KEY (Id_Cartao) REFERENCES Cartao_Credito(Id_Cartao) ON DELETE CASCADE
);

CREATE TABLE Lancamentos_Cartao (
    ID_Lancamento INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Cartao INTEGER NOT NULL,
    Descricao VARCHAR(200) NOT NULL,
    Valor DECIMAL(14,2) NOT NULL,
    Parcelas INTEGER NOT NULL,
    Data DATE NOT NULL,
    FOREIGN KEY (Id_Cartao) REFERENCES Cartao_Credito(Id_Cartao) ON DELETE CASCADE
);

CREATE TABLE Transferencia (
    Id_Transferencia INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Conta INTEGER NOT NULL,
    Id_Cartao INTEGER,
    Valor DECIMAL(14,2) NOT NULL,
    Data_Transferencia DATE NOT NULL,
    Tipo_Transferencia ENUM('dinheiro', 'Cartão de Crédito') NOT NULL,
    Status ENUM('pendente', 'cancelado', 'concluído') DEFAULT 'concluído',
    FOREIGN KEY (Id_Conta) REFERENCES Conta(IdConta) ON DELETE CASCADE,
    FOREIGN KEY (Id_Cartao) REFERENCES Cartao_Credito(Id_Cartao) ON DELETE CASCADE
);

CREATE TABLE Extrato_Conta (
    Id_Extrato INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Conta INTEGER NOT NULL,
    Descricao VARCHAR(200) NOT NULL,
    Valor DECIMAL(14,2) NOT NULL,
    Data DATE NOT NULL,
    FOREIGN KEY (Id_Conta) REFERENCES Conta(IdConta) ON DELETE CASCADE
);

-- Tabelas para o E-commerce
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

-- Tabela de sessões (para controle de login)
CREATE TABLE sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de produtos (placeholder para funcionalidade futura)
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
