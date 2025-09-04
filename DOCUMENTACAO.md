# 📚 DOCUMENTAÇÃO TÉCNICA - GOIA SHOP

## 🎯 Visão Geral

Sistema de backoffice para gerenciamento de loja online com autenticação segura e controle de acesso baseado em perfis de usuário.

## 🏗️ Arquitetura

### Frontend (React)
- **Login**: Autenticação de usuários
- **Dashboard**: Painel principal com navegação
- **Landing Page**: Página inicial da aplicação

### Backend (Spring Boot)
- **AuthController**: Endpoints de autenticação
- **UsuarioController**: CRUD de usuários
- **ProdutoController**: Listagem de produtos
- **AuthService**: Lógica de autenticação
- **UserService**: Lógica de negócio de usuários
- **PasswordService**: Criptografia BCrypt

### Banco de Dados (MySQL)
- **users**: Tabela de usuários do sistema
- **produtos_ecommerce**: Tabela de produtos

## 🔐 Segurança

### Criptografia
- **Algoritmo**: BCrypt
- **Salt**: Automático
- **Rounds**: 10

### Controle de Acesso
- **ADMIN**: Acesso total
- **ESTOQUISTA**: Acesso limitado a produtos
- **CLIENTE**: Bloqueado no backoffice

## 📡 API Endpoints

### Autenticação
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/validate
```

### Usuários
```
GET  /api/usuarios
GET  /api/usuarios/{id}
POST /api/usuarios/cadastrar
PUT  /api/usuarios/{id}/alterar
PUT  /api/usuarios/{id}/status
```

### Produtos
```
GET /api/produtos
GET /api/produtos/{id}
```

## 🚀 Instalação

```bash
# Clonar repositório
git clone <url>
cd goia-shop

# Executar com Docker
docker-compose up -d

# Acessar aplicação
http://localhost:3000
```

## 👥 Usuários Padrão

**Administrador:**
- Email: admin@goiashop.com
- Senha: admin123

**Estoquista:**
- Email: estoquista@goiashop.com
- Senha: estoque123

## 🔧 Configuração

### Variáveis de Ambiente
- **MySQL**: localhost:3306
- **Backend**: localhost:8080
- **Frontend**: localhost:3000

### Banco de Dados
- **Database**: BancoGOIA
- **User**: goia
- **Password**: goia123

## 📁 Estrutura de Arquivos

```
goia-shop/
├── frontend/src/components/
│   ├── Login.js
│   ├── Dashboard.js
│   └── LandingPage.js
├── backend/src/main/java/com/goiashop/
│   ├── controller/
│   ├── service/
│   └── model/
└── db/init/schema.sql
```

## 🐛 Troubleshooting

**Erro de conexão:**
```bash
docker-compose restart
```

**Problema de CORS:**
- Verificar CorsConfig.java
- allowCredentials deve ser false

**Login não funciona:**
- Verificar se usuários existem no banco
- Verificar logs do backend

## 📝 Changelog

### v0.2.0
- Landing page implementada
- Criptografia simplificada (apenas BCrypt)
- CORS corrigido
- Banco atualizado

### v0.1.1
- Sistema de autenticação
- CRUD de usuários
- Interface responsiva

## 🤝 Desenvolvimento

### Comandos Úteis
```bash
# Ver logs
docker-compose logs -f

# Reiniciar serviço
docker-compose restart backend

# Parar tudo
docker-compose down
```

### Padrões de Código
- **Java**: CamelCase para métodos e variáveis
- **JavaScript**: camelCase para variáveis, PascalCase para componentes
- **SQL**: snake_case para tabelas e colunas

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do Docker
2. Consultar esta documentação
3. Abrir issue no repositório
