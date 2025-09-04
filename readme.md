<a href="#">
  <img 
    width="100%" 
    src="https://capsule-render.vercel.app/api?type=waving&color=ff69b4&height=120&section=header&text=&fontSize=30&fontColor=000000&animation=twinkling"
  />
</a>

<p align="center">
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/paper-shopping-bag-3d-icon-download-in-png-blend-fbx-gltf-file-formats--online-pack-e-commerce-icons-5655179.png" 
    alt="Logo SQL"
    width="300px"
  />
</p>

# GOIA Shop - Full Stack E-commerce Platform

Este projeto representa a estrutura completa da loja e-commerce GOIA Shop, incluindo frontend React, backend Spring Boot, e banco de dados MySQL, todos containerizados com Docker.

## 🏗️ Arquitetura do Projeto

O projeto está dividido em três componentes principais, cada um em seu próprio container Docker:

### 📱 Frontend (React)
- **Tecnologia**: React 18 com hooks funcionais
- **UI Framework**: React Bootstrap
- **Porta**: 80 (HTTP)
- **Funcionalidades**: 
  - Interface responsiva para gerenciamento de produtos
  - CRUD completo (Create, Read, Update, Delete)
  - Modal para adicionar/editar produtos
  - Grid de produtos com cards

### 🔧 Backend (Spring Boot)
- **Tecnologia**: Spring Boot 3.1.0 com Java 17
- **Framework**: Spring Data JPA, Spring Web
- **Porta**: 8080
- **API**: RESTful endpoints para CRUD de produtos
- **Banco**: MySQL 8.0

### 🗄️ Banco de Dados (MySQL)
- **Versão**: MySQL 8.0
- **Porta**: 3306
- **Banco**: BancoGOIA
- **Tabelas**: Produtos com validações

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Docker Desktop instalado e em execução
- Docker Compose instalado
- Mínimo 4GB RAM disponível

### 1. Clone o Repositório
```bash
git clone https://github.com/MarceloAfonso-dev/goia-shop.git
cd goia-shop
```

### 2. Iniciar Todos os Serviços
```bash
docker compose up -d
```

Este comando irá:
- Construir as imagens Docker para frontend e backend
- Iniciar o banco MySQL
- Aguardar o banco estar saudável
- Iniciar o backend Spring Boot
- Iniciar o frontend React

### 3. Verificar Status dos Serviços
```bash
docker compose ps
```

### 4. Acessar as Aplicações
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Banco de Dados**: localhost:3306

## 📋 Endpoints da API

### Produtos
- `GET /api/products` - Listar todos os produtos
- `GET /api/products/{id}` - Buscar produto por ID
- `POST /api/products` - Criar novo produto
- `PUT /api/products/{id}` - Atualizar produto existente
- `DELETE /api/products/{id}` - Deletar produto

### Exemplo de Criação de Produto
```json
{
  "name": "Produto Exemplo",
  "description": "Descrição do produto",
  "price": 29.99,
  "stock": 100
}
```

## 🛠️ Desenvolvimento

### Estrutura de Diretórios
```
goia-shop/
├── frontend/                 # Aplicação React
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── backend/                  # Aplicação Spring Boot
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── pom.xml
│   └── Dockerfile
├── db/                      # Scripts de inicialização do banco
├── docker-compose.yml       # Configuração dos containers
└── README.md
```

### Comandos Úteis

#### Parar todos os serviços
```bash
docker compose down
```

#### Ver logs de um serviço específico
```bash
docker compose logs frontend
docker compose logs backend
docker compose logs db
```

#### Reconstruir e reiniciar um serviço
```bash
docker compose up -d --build frontend
docker compose up -d --build backend
```

#### Acessar container para debug
```bash
docker exec -it goia-shop-backend /bin/bash
docker exec -it goia-shop-frontend /bin/sh
```

## 🔧 Configurações

### Variáveis de Ambiente
- **Database**: Configurado no docker-compose.yml
- **Backend**: Configurado em application.properties
- **Frontend**: Configurado no nginx.conf

### Portas
- **Frontend**: 80 (HTTP)
- **Backend**: 8080
- **Database**: 3306

## 🧪 Testando a Aplicação

1. Acesse http://localhost
2. Clique em "Add Product" para criar um produto
3. Preencha os campos e salve
4. Edite ou delete produtos conforme necessário

## 🐛 Troubleshooting

### Problemas Comuns

#### Backend não consegue conectar ao banco
```bash
docker compose logs backend
```
Verifique se o banco está saudável antes do backend iniciar.

#### Frontend não carrega
```bash
docker compose logs frontend
```
Verifique se o nginx está rodando corretamente.

#### Erro de permissão no Windows
Execute o PowerShell como administrador.

## 📚 Tecnologias Utilizadas

- **Frontend**: React 18, React Bootstrap, Axios
- **Backend**: Spring Boot 3.1.0, Spring Data JPA, Java 17
- **Database**: MySQL 8.0
- **Containerização**: Docker, Docker Compose
- **Proxy**: Nginx

## 🤝 Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ pela equipe GOIA Shop**
