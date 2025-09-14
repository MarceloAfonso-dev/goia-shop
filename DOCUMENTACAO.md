# 📚 DOCUMENTAÇÃO TÉCNICA - GOIA SHOP

## 🎯 Visão Geral

Sistema de backoffice para gerenciamento de loja online com autenticação segura, controle de acesso baseado em perfis de usuário e sistema completo de gestão de produtos com upload de imagens.

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização
- Login seguro com JWT
- Controle de acesso por perfis (Admin, Estoquista, Cliente)
- Sessões stateless com tokens
- Logout seguro

### 👥 Gestão de Usuários
- Listagem completa de usuários
- Cadastro de novos usuários
- Edição de dados de usuários
- Controle de status (ativo/inativo)
- Validação de permissões por perfil

### 📦 Gestão de Produtos
- Listagem de produtos com filtros
- Cadastro de produtos em etapas
- Upload múltiplo de imagens (até 5 por produto)
- Seleção de imagem principal
- Preview de imagens antes do upload
- Validação segura de arquivos (magic bytes + MIME)
- Edição e remoção de produtos

### 🖼️ Sistema de Imagens
- Upload seguro com validação de tipos
- Suporte a JPEG, PNG, GIF, WebP
- Limite de 5MB por arquivo
- Nomes únicos com UUID
- Sanitização de nomes de arquivo
- Armazenamento em filesystem organizado

### 🛡️ Segurança
- Criptografia BCrypt para senhas
- Validação dupla de tipos de arquivo
- Sanitização de inputs
- CORS configurado
- Logs de auditoria

## 🏗️ Arquitetura

### Frontend (React)
- **Login**: Autenticação de usuários
- **Dashboard**: Painel principal com navegação
- **Landing Page**: Página inicial da aplicação

### Backend (Spring Boot)
- **AuthController**: Endpoints de autenticação e JWT
- **UsuarioController**: CRUD completo de usuários
- **ProdutoController**: CRUD de produtos com upload de imagens
- **AuthService**: Lógica de autenticação e validação
- **UserService**: Gerenciamento de usuários e permissões
- **ProdutoService**: Gerenciamento de produtos e imagens
- **PasswordService**: Criptografia BCrypt
- **ImageStorageFilesystem**: Sistema de armazenamento de imagens
- **FileUploadService**: Serviço de upload de arquivos
- **JwtService**: Geração e validação de tokens JWT
- **AuditLogService**: Log de auditoria do sistema

### Frontend (React)
- **Login**: Autenticação com JWT
- **Dashboard**: Painel principal navegável
- **LandingPage**: Página inicial da aplicação
- **ProductList**: Listagem e gerenciamento de produtos
- **ProductCadastroModal**: Cadastro de produtos com upload de imagens
- **UsuarioCadastroModal**: Cadastro de novos usuários
- **UsuarioAlteracaoModal**: Edição de usuários existentes
- **UserList**: Listagem e gerenciamento de usuários

### Banco de Dados (MySQL)
- **users**: Usuários do sistema com controle de acesso
- **produtos_ecommerce**: Produtos do e-commerce
- **produto_imagens**: Imagens associadas aos produtos
- **audit_logs**: Logs de auditoria das operações

## 🔐 Segurança

### Criptografia
- **Algoritmo**: BCrypt para senhas
- **JWT**: Tokens para autenticação stateless
- **Salt**: Geração automática pelo BCrypt
- **Rounds**: 10 (configurável)

### Upload de Imagens
- **Validação de Tipo**: Magic bytes + MIME type
- **Tamanho Máximo**: 5MB por arquivo
- **Formatos Aceitos**: JPEG, PNG, GIF, WebP
- **Sanitização**: Nomes de arquivo limpos
- **UUID**: Nomes únicos para evitar conflitos
- **Limite**: 5 imagens por produto

### Controle de Acesso
- **ADMIN**: Acesso total ao sistema
- **ESTOQUISTA**: Produtos e relatórios

## 🔄 Alterações de Segurança e Configuração

### 🛡️ Remoção da Criptografia do Frontend
**Problema Resolvido**: Eliminação de vulnerabilidades de segurança no cliente

**Alterações Implementadas**:
- ❌ **Removido**: Módulo `crypto-js` e hash SHA-256 no frontend
- ✅ **Implementado**: Envio de senhas em texto plano via HTTPS
- ✅ **Centralizado**: Toda criptografia BCrypt exclusivamente no backend
- 📁 **Arquivos alterados**: `Login.js`, `UsuarioCadastroModal.js`, `UsuarioAlteracaoModal.js`

**Justificativa**: Criptografia no cliente é insegura e expõe algoritmos. HTTPS + BCrypt no servidor é a abordagem mais segura.

### ⚙️ Configuração de Proxy para Docker
**Problema Resolvido**: Falhas de comunicação entre frontend e backend em ambiente containerizado

**Solução Implementada**:
- ✅ **Criado**: `frontend/src/setupProxy.js` para configuração específica do Docker
- ✅ **Configurado**: Roteamento automático `/api/*` → `http://backend:8080`
- ✅ **Substituído**: Configuração `package.json` por solução mais robusta
- 🔧 **Benefício**: Resolução DNS interna e logs de debug

### 🗄️ Inicialização Automática de Usuários via Java
**Problema Resolvido**: Corrupção de hashes BCrypt durante inicialização do banco via SQL

**Implementação**:
- ✅ **Criado**: `DataInitializer.java` - Componente Spring Boot
- ✅ **Automático**: Criação de usuários com BCrypt na inicialização da aplicação
- ✅ **Seguro**: Hashes gerados diretamente no contexto Java (sem corrupção)
- ✅ **Inteligente**: Verifica existência antes de criar (não duplica)

**Usuários Criados Automaticamente**:
- 👤 **Admin**: `admin@goiashop.com` / `adm123`
- 📦 **Estoquista**: `estoquista@goiashop.com` / `estoque123`

### 🔐 Sistema de Criptografia Robusto
**Implementação BCrypt**:
- **Algoritmo**: BCrypt com salt automático
- **Formato**: `$2a$10$` (60 caracteres total)
- **Custo**: 10 rounds (resistente a força bruta)
- **Compatibilidade**: Funciona em qualquer ambiente/SO

**Resultado**: Zero problemas de encoding, máxima portabilidade e segurança garantida.
- **CLIENTE**: Bloqueado no backoffice

### CORS e Segurança Web
- **Origins**: localhost:3000, frontend:3000
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Configuração flexível para desenvolvimento

## 📡 API Endpoints

### Autenticação
```
POST /api/auth/login    - Login com email/senha
POST /api/auth/logout   - Logout do usuário
GET  /api/auth/validate - Validação de token JWT
```

### Usuários
```
GET  /api/usuarios           - Listar usuários
GET  /api/usuarios/{id}      - Buscar usuário específico
POST /api/usuarios/cadastrar - Cadastrar novo usuário
PUT  /api/usuarios/{id}/alterar - Alterar dados do usuário
PUT  /api/usuarios/{id}/status  - Alterar status do usuário
```

### Produtos
```
GET  /api/produtos             - Listar produtos
GET  /api/produtos/{id}        - Buscar produto específico
POST /api/produtos/cadastrar   - Cadastrar novo produto
PUT  /api/produtos/{id}        - Alterar produto existente
DELETE /api/produtos/{id}      - Remover produto
```

### Upload de Imagens
```
POST /api/produtos/{id}/imagens - Upload de imagens para produto
GET  /uploads/{filename}        - Acesso às imagens (estático)
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
- **MySQL**: db:3306 (container) / localhost:3306 (local)
- **Backend**: backend:8080 (container) / localhost:8080 (local)
- **Frontend**: frontend:3000 (container) / localhost:3000 (local)

### Banco de Dados
- **Database**: BancoGOIA
- **User**: goia
- **Password**: goia123
- **Timezone**: UTC

### Upload de Arquivos
- **Diretório**: uploads/ (mapeado como volume Docker)
- **Tamanho Máximo**: 5MB por arquivo
- **Tipos Permitidos**: JPEG, PNG, GIF, WebP
- **URL Base**: http://localhost:8080/uploads/

### JWT Configuration
- **Algoritmo**: HS256
- **Expiração**: Configurável via application.properties
- **Secret**: Gerado automaticamente ou via variável de ambiente

## 📁 Estrutura de Arquivos

```
goia-shop/
├── frontend/
│   ├── src/components/
│   │   ├── Login.js                  - Autenticação de usuários
│   │   ├── Dashboard.js              - Painel principal
│   │   ├── LandingPage.js           - Página inicial
│   │   ├── ProductList.js           - Listagem de produtos
│   │   ├── ProductCadastroModal.js  - Cadastro de produtos com imagens
│   │   ├── UserList.js              - Listagem de usuários
│   │   ├── UsuarioCadastroModal.js  - Cadastro de usuários
│   │   └── UsuarioAlteracaoModal.js - Edição de usuários
│   ├── src/hooks/
│   │   └── useAuth.js               - Hook de autenticação
│   └── src/utils/
│       ├── api.js                   - Cliente HTTP/API
│       └── crypto.js                - Utilitários de criptografia
├── backend/src/main/java/com/goiashop/
│   ├── controller/
│   │   ├── AuthController.java      - Endpoints de autenticação
│   │   ├── UsuarioController.java   - CRUD de usuários
│   │   └── ProdutoController.java   - CRUD de produtos + upload
│   ├── service/
│   │   ├── AuthService.java         - Lógica de autenticação
│   │   ├── UserService.java         - Gerenciamento de usuários
│   │   ├── ProdutoService.java      - Gerenciamento de produtos
│   │   ├── PasswordService.java     - Criptografia de senhas
│   │   ├── JwtService.java          - Tokens JWT
│   │   ├── ImageStorageFilesystem.java - Armazenamento de imagens
│   │   ├── FileUploadService.java   - Upload de arquivos
│   │   └── AuditLogService.java     - Auditoria do sistema
│   ├── model/
│   │   ├── User.java                - Modelo de usuário
│   │   ├── Produto.java             - Modelo de produto
│   │   └── ProdutoImagem.java       - Modelo de imagem do produto
│   └── repository/
│       ├── UserRepository.java      - Repositório de usuários
│       ├── ProdutoRepository.java   - Repositório de produtos
│       └── ProdutoImagemRepository.java - Repositório de imagens
├── db/init/schema.sql               - Schema inicial do banco
├── uploads/                         - Diretório de arquivos enviados
└── docker-compose.yml              - Configuração dos containers
```

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de conexão com banco:**
```bash
docker-compose restart db
docker-compose logs db
```

**Backend não inicia:**
```bash
docker-compose restart backend
docker-compose logs backend
```

**Upload de imagens falha:**
- Verificar se o diretório `uploads/` existe
- Verificar permissões do volume Docker
- Verificar tamanho do arquivo (máx 5MB)
- Verificar tipo de arquivo (JPEG, PNG, GIF, WebP)

**Problema de CORS:**
- Verificar CorsConfig.java
- allowCredentials deve ser false para desenvolvimento
- Verificar origins permitidas

**Login não funciona:**
- Verificar se usuários existem no banco
- Verificar logs do backend para erros de autenticação
- Verificar se JWT está sendo gerado corretamente

**Imagens não aparecem:**
- Verificar se o arquivo foi enviado para `uploads/`
- Verificar configuração de URL base
- Verificar mapeamento de volumes no Docker

### Logs Úteis
```bash
# Ver todos os logs
docker-compose logs -f

# Logs específicos de um serviço
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Ver status dos containers
docker-compose ps
```

## 📝 Changelog

### v0.3.0 - Sistema de Upload de Imagens
- Implementado upload múltiplo de imagens para produtos
- Sistema de armazenamento seguro com validação de tipos
- Interface para seleção de imagem principal
- Validação por magic bytes e MIME types
- Sanitização de nomes de arquivos com UUID
- Preview de imagens antes do upload
- Modal de cadastro de produtos em etapas

### v0.2.0 - Landing Page e Melhorias
- Landing page implementada
- Criptografia simplificada (apenas BCrypt)
- CORS corrigido para desenvolvimento
- Banco de dados atualizado
- Controle de acesso melhorado

### v0.1.1 - Sistema Base
- Sistema de autenticação com JWT
- CRUD completo de usuários
- Interface responsiva com Bootstrap
- Docker Compose para desenvolvimento

## 🤝 Desenvolvimento

### Comandos Úteis
```bash
# Iniciar ambiente completo
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Reiniciar serviço específico
docker-compose restart backend
docker-compose restart frontend

# Parar ambiente
docker-compose down

# Rebuild de imagens
docker-compose build --no-cache

# Acessar bash do container
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Estrutura de Desenvolvimento
- **Frontend**: React 18 com Bootstrap 5
- **Backend**: Spring Boot 3 com Maven
- **Banco**: MySQL 8.0
- **Containerização**: Docker Compose

### Padrões de Código
- **Java**: CamelCase para métodos e variáveis, PascalCase para classes
- **JavaScript**: camelCase para variáveis, PascalCase para componentes React
- **SQL**: snake_case para tabelas e colunas
- **Arquivos**: kebab-case para nomes de arquivos

### Fluxo de Upload de Imagens
1. Frontend valida arquivos (tipo, tamanho)
2. Produto é criado no backend
3. Imagens são enviadas individualmente
4. Backend valida magic bytes + MIME type
5. Arquivo é salvo com UUID único
6. Metadata é persistida no banco

### Configurações de Segurança
- Validação dupla de tipos de arquivo
- Sanitização de nomes de arquivo
- Limite de tamanho por arquivo e por request
- CORS configurado para desenvolvimento
- JWT com expiração configurável

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do Docker
2. Consultar esta documentação
3. Abrir issue no repositório
