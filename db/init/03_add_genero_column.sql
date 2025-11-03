-- Script para adicionar coluna de gênero na tabela clientes
USE BancoGOIA;

-- Adicionar coluna genero na tabela clientes
ALTER TABLE clientes 
ADD COLUMN genero ENUM('MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO') DEFAULT 'NAO_INFORMADO' 
AFTER data_nascimento;
