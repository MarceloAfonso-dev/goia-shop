-- Adicionar estrutura de categorias
-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Adicionar campo categoria_id na tabela produtos_ecommerce
ALTER TABLE produtos_ecommerce ADD COLUMN categoria_id BIGINT NULL;
ALTER TABLE produtos_ecommerce ADD CONSTRAINT fk_produto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id);

-- Inserir algumas categorias padrão
INSERT INTO categorias (nome, descricao) VALUES 
('Eletrônicos', 'Dispositivos eletrônicos em geral'),
('Smartphones', 'Telefones celulares e acessórios'),
('Computadores', 'Notebooks, desktops e periféricos'),
('TVs e Audio', 'Televisores, caixas de som e equipamentos de áudio'),
('Gaming', 'Consoles, jogos e acessórios para games'),
('Casa Inteligente', 'Dispositivos smart para casa'),
('Câmeras', 'Câmeras fotográficas e filmadoras'),
('Instrumentos Musicais', 'Guitarras, teclados e instrumentos diversos');

-- Atualizar produtos existentes com categorias (baseado nos nomes)
UPDATE produtos_ecommerce SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Smartphones' LIMIT 1) 
WHERE nome LIKE '%Galaxy%' OR nome LIKE '%iPhone%' OR nome LIKE '%Smartphone%';

UPDATE produtos_ecommerce SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Computadores' LIMIT 1) 
WHERE nome LIKE '%Notebook%' OR nome LIKE '%Dell%' OR nome LIKE '%Monitor%';

UPDATE produtos_ecommerce SET categoria_id = (SELECT id FROM categorias WHERE nome = 'TVs e Audio' LIMIT 1) 
WHERE nome LIKE '%TV%' OR nome LIKE '%Smart TV%' OR nome LIKE '%Headset%' OR nome LIKE '%Fone%';

UPDATE produtos_ecommerce SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Gaming' LIMIT 1) 
WHERE nome LIKE '%PlayStation%' OR nome LIKE '%Console%' OR nome LIKE '%Gamer%';

UPDATE produtos_ecommerce SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Casa Inteligente' LIMIT 1) 
WHERE nome LIKE '%Watch%' OR nome LIKE '%Smartwatch%';

UPDATE produtos_ecommerce SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Câmeras' LIMIT 1) 
WHERE nome LIKE '%Câmera%' OR nome LIKE '%Canon%';

UPDATE produtos_ecommerce SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Eletrônicos' LIMIT 1) 
WHERE nome LIKE '%Tablet%' OR nome LIKE '%iPad%';

UPDATE produtos_ecommerce SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Instrumentos Musicais' LIMIT 1) 
WHERE nome LIKE '%Guitar%' OR nome LIKE '%Les Paul%';

-- Para produtos que não foram categorizados, usar categoria padrão
UPDATE produtos_ecommerce SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Eletrônicos' LIMIT 1) 
WHERE categoria_id IS NULL;