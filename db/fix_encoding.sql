-- Fix encoding issues in categorias table
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update category names with proper UTF-8 encoding
UPDATE categorias SET nome = 'Câmeras' WHERE nome LIKE '%meras%';
UPDATE categorias SET nome = 'Eletrônicos' WHERE nome LIKE '%nicos%';
UPDATE categorias SET descricao = 'Câmeras fotográficas e filmadoras' WHERE descricao LIKE '%ficas e fil%';

-- Verify the changes
SELECT id, nome, descricao FROM categorias ORDER BY id;