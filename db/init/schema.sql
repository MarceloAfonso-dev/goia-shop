CREATE DATABASE IF NOT EXISTS appdb;
USE appdb;

-- E-commerce backoffice users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  cpf CHAR(11) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  senha_hash VARCHAR(100) NOT NULL, -- BCrypt(SHA-256)
  grupo ENUM('ADMIN','ESTOQUISTA') NOT NULL,
  status ENUM('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cpf (cpf)
);

-- Existing banking system tables from preSQL (preserved)
CREATE TABLE IF NOT EXISTS Instituicao (
    ID_instituicao INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Razao_Social VARCHAR(100) NOT NULL UNIQUE,
    CNPJ VARCHAR(14) NOT NULL UNIQUE,
    CEP VARCHAR(8) NOT NULL
);

CREATE TABLE IF NOT EXISTS Cliente (
    ID INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    Nome VARCHAR(100) NOT NULL,
    Sobrenome VARCHAR(250) NOT NULL,
    CPF VARCHAR(11) NOT NULL UNIQUE,  
    Telefone VARCHAR(11) NOT NULL,
    CEP VARCHAR(8) NOT NULL,
    Data_Nascimento DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS Conta (
    IdConta INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ID_Cliente INTEGER NOT NULL,  
    Numero_Conta VARCHAR(10) NOT NULL UNIQUE,
    Senha VARCHAR(8) NOT NULL,
    Saldo DECIMAL(14,2) NOT NULL,
    Limite_Credito DECIMAL(14,2) NOT NULL,
    Data_Criacao DATE NOT NULL,
    FOREIGN KEY (ID_Cliente) REFERENCES Cliente(ID) ON DELETE CASCADE  
);

CREATE TABLE IF NOT EXISTS Pagamento (
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

CREATE TABLE IF NOT EXISTS Produtos (
    ID_Produto INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Conta INTEGER NOT NULL,
    Servico ENUM('Cheque Especial', 'Cartão de Crédito', 'CDB') NOT NULL UNIQUE,
    FOREIGN KEY (Id_Conta) REFERENCES Conta(IdConta) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Cheque_Especial (
    Id_Cheque INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Conta INTEGER NOT NULL,
    Valor DECIMAL(14,2) NOT NULL,
    Limite_Cheque DECIMAL(14,2) NOT NULL,
    Subtotal DECIMAL(14,2),
    Situacao_Pagamento ENUM('pendente', 'aprovado', 'cancelado') DEFAULT 'aprovado',
    FOREIGN KEY (Id_Conta) REFERENCES Conta(IdConta) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Cartao_Credito (
    Id_Cartao INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Conta INTEGER NOT NULL,
    Valor_Utilizado DECIMAL(14,2) NOT NULL,
    Limite DECIMAL(14,2) NOT NULL,
    Status_Bloqueio BOOLEAN DEFAULT FALSE,
    Status_Cartao ENUM('ativo', 'inativo', 'bloqueado') NOT NULL,
    FOREIGN KEY (Id_Conta) REFERENCES Conta(IdConta) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Fatura_Cartao (
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

CREATE TABLE IF NOT EXISTS Lancamentos_Cartao (
    ID_Lancamento INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Cartao INTEGER NOT NULL,
    Descricao VARCHAR(200) NOT NULL,
    Valor DECIMAL(14,2) NOT NULL,
    Parcelas INTEGER NOT NULL,
    Data DATE NOT NULL,
    FOREIGN KEY (Id_Cartao) REFERENCES Cartao_Credito(Id_Cartao) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Transferencia (
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

CREATE TABLE IF NOT EXISTS Extrato_Conta (
    Id_Extrato INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Id_Conta INTEGER NOT NULL,
    Descricao VARCHAR(200) NOT NULL,
    Valor DECIMAL(14,2) NOT NULL,
    Data DATE NOT NULL,
    FOREIGN KEY (Id_Conta) REFERENCES Conta(IdConta) ON DELETE CASCADE
);