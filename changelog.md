# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.3.0] - 2025-09-11 - Marcelo Afonso

### Added
- **Backend**: Sistema completo de upload de imagens para produtos
  - Service `ImageStorageFilesystem` com arquitetura robusta e segura
  - Validação de tipos de arquivo por magic bytes e MIME type
  - Sanitização de nomes de arquivo com geração de UUID únicos
  - Suporte a JPEG, PNG, GIF e WebP com limite de 5MB por arquivo
  - Configuração flexível via `application.properties`
- **Backend**: Model `ProdutoImagem` para gerenciamento de metadados de imagens
  - Relacionamento OneToMany com produtos
  - Controle de imagem principal e ordem de exibição
  - Timestamps de criação e atualização
  - URLs de acesso público para imagens
- **Backend**: Repository `ProdutoImagemRepository` para persistência de imagens
- **Backend**: Endpoints REST para upload de imagens em `ProdutoController`
  - `POST /api/produtos/{id}/imagens` - Upload múltiplo de imagens
  - Validação de permissões e limites por produto
- **Backend**: Service `FileUploadService` para validações adicionais de segurança
- **Backend**: Configuração de servir arquivos estáticos via Spring Boot
- **Frontend**: Modal `ProductCadastroModal` para cadastro completo de produtos
  - Interface em duas etapas: dados básicos e upload de imagens
  - Preview de imagens em tempo real
  - Seleção de imagem principal com interface visual
  - Validação client-side de tipos e tamanhos de arquivo
  - Feedback visual de progresso de upload
- **Frontend**: Integração completa com API de upload no `ProductList`
- **Infraestrutura**: Volume Docker persistente para diretório `uploads/`
- **Documentação**: Atualização completa da `DOCUMENTACAO.md` com todas as funcionalidades

### Changed
- **Backend**: Refatoração do `ProdutoService` para incluir gerenciamento de imagens
  - Método `cadastrarProduto()` com suporte a upload simultâneo
  - Método `adicionarImagem()` para upload individual de imagens
  - Validação de limites e permissões de usuário
- **Backend**: Modelo `Produto` expandido com relacionamento de imagens
  - Lista de imagens associadas com cascade operations
  - Métodos utilitários para gerenciamento de imagens
  - Suporte a imagem principal automática
- **Backend**: Configuração de upload em `application.properties`
  - Limites de tamanho de arquivo e request
  - Diretório de upload configurável via variável de ambiente
  - Tipos de arquivo permitidos configuráveis
- **Frontend**: Componente `ProductList` com botão de cadastro de produtos
- **Arquitetura**: Implementação do padrão Strategy para storage de imagens
  - Interface `ImageStorage` para futuras implementações (S3, etc.)
  - Implementação `ImageStorageFilesystem` para sistema de arquivos local

### Fixed
- **Backend**: Problemas de upload em ambiente Docker containerizado
  - Correção de paths relativos vs absolutos
  - Substituição de `MultipartFile.transferTo()` por `Files.copy()` para maior compatibilidade
  - Resolução de problemas com diretórios temporários em containers
- **Backend**: Validação robusta de tipos de arquivo
  - Verificação por magic bytes além de MIME type
  - Prevenção de bypass de validação via renomeação de arquivos
- **Frontend**: Tratamento de erros de upload com feedback adequado ao usuário
- **Frontend**: Validação de múltiplos arquivos com limites de quantidade

### Removed
- **Backend**: Código de debug e logs desnecessários após testes
  - Remoção de `System.out.println` statements
  - Limpeza de comentários de desenvolvimento
- **Frontend**: Componentes de debug da interface de upload
  - Remoção de alertas de debug
  - Limpeza de console.log statements
  - Remoção de estados não utilizados

### Security
- **Backend**: Validação dupla de segurança para uploads
  - Magic bytes verification para detecção real do tipo de arquivo
  - MIME type validation como camada adicional
  - Sanitização completa de nomes de arquivo
  - Geração de UUIDs para evitar conflitos e ataques de path traversal
- **Backend**: Limites rígidos de tamanho e quantidade de arquivos
  - 5MB máximo por arquivo
  - 5 imagens máximo por produto
  - 10MB máximo por request HTTP
- **Backend**: Isolamento de arquivos em diretório específico com controle de acesso

### Performance
- **Backend**: Otimização de queries com relacionamentos JPA
  - Lazy loading para imagens de produtos
  - Cascade operations otimizadas
- **Frontend**: Upload assíncrono com feedback de progresso
  - Interface não bloqueante durante uploads
  - Preview instantâneo de imagens selecionadas

## [0.2.0] - 2025-09-04 - Pedro Ibanez

### Added
- **Frontend**: Landing page completa com design moderno e responsivo
- **Frontend**: Componente `LandingPage` com seções hero, categorias, produtos em destaque e FAQ
- **Frontend**: Sistema de navegação entre Landing Page, Login e Dashboard
- **Frontend**: Botão de login na landing page que redireciona para o fluxo de autenticação
- **Frontend**: Fonte Google Fonts (Inter) para melhor tipografia
- **Backend**: Controller `TestController` para testes de criptografia de senhas
- **Backend**: Endpoints de teste `/api/test/password` e `/api/test/validate`
- **Infraestrutura**: Imagens de placeholder da Unsplash para categorias e produtos

### Changed
- **Segurança**: Simplificação do sistema de criptografia de senhas
  - Removida dupla criptografia (SHA-256 + BCrypt)
  - Implementado apenas BCrypt para maior simplicidade e confiabilidade
- **Frontend**: Utilitário `crypto.js` simplificado para enviar senhas em texto puro
- **Backend**: `PasswordService` refatorado para usar apenas BCrypt
- **Backend**: `AuthService` atualizado para validação direta com BCrypt
- **Backend**: `AuthController` removido endpoint de desenvolvimento desnecessário
- **Backend**: `TestController` atualizado para testes com apenas BCrypt
- **Banco de Dados**: Schema atualizado com novos hashes BCrypt para usuários padrão
- **CORS**: Configuração corrigida para `allowCredentials(false)` resolvendo erro 500

### Fixed
- **Backend**: Erro 500 na listagem de produtos devido a configuração CORS incorreta
- **Frontend**: Erro de módulo não encontrado para imagem de background na landing page
- **Frontend**: Problemas de carregamento de imagens locais substituídos por URLs do Unsplash
- **Autenticação**: Problema de incompatibilidade entre criptografia frontend/backend
- **Banco de Dados**: Dados antigos com hashes incompatíveis após mudança de criptografia

### Removed
- **Backend**: Método `applySHA256()` do `PasswordService`
- **Backend**: Método `applyBCrypt()` do `PasswordService` (substituído por `encryptPassword()`)
- **Backend**: Método `validatePassword()` duplicado do `AuthService`
- **Backend**: Endpoint `/api/auth/dev/generate-sha256` do `AuthController`
- **Frontend**: Lógica de criptografia SHA-256 no `crypto.js`
- **Frontend**: Funções `hashSHA256()`, `isWebCryptoSupported()`, `simpleHashFallback()`

### Security
- **Backend**: Migração para BCrypt puro (mais seguro e padrão da indústria)
- **Frontend**: Remoção de criptografia client-side (senhas enviadas em texto puro para o backend)
- **Banco de Dados**: Atualização de todos os hashes de senha para novo formato BCrypt



## [0.1.1] - 2025-09-03 - Pedro Ibanez

### Added
- **Frontend**: Implementação completa do sistema de autenticação com JWT
- **Frontend**: Tela de login responsiva com validação de formulário
- **Frontend**: Dashboard principal com navegação baseada em perfil de usuário
- **Frontend**: Lista de produtos com estatísticas e visualização em tabela
- **Frontend**: Lista de usuários (acesso restrito a administradores)
- **Frontend**: Sistema de roteamento baseado em autenticação
- **Frontend**: Hook personalizado `useAuth` para gerenciamento de estado de autenticação
- **Frontend**: Utilitário `api.js` com interceptors para JWT e tratamento de erros
- **Frontend**: Componentes React Bootstrap para interface moderna e responsiva
- **Backend**: Controller `ProdutoController` com endpoints REST para produtos
- **Backend**: Controller `UsuarioController` com endpoints REST para usuários
- **Backend**: Service `ProdutoService` com lógica de negócio para produtos
- **Backend**: Service `UserService` com lógica de negócio para usuários
- **Backend**: Repository `ProdutoRepository` com métodos personalizados de consulta
- **Backend**: Repository `UserRepository` com métodos personalizados de consulta
- **Backend**: Modelo `Produto` com campos em português e validações JPA
- **Backend**: Endpoints de API RESTful para autenticação, produtos e usuários
- **Backend**: Suporte a CORS para integração frontend-backend
- **Infraestrutura**: Docker Compose para orquestração de serviços
- **Infraestrutura**: Banco de dados MySQL com dados de teste
- **Infraestrutura**: Configuração de ambiente de desenvolvimento

### Changed
- **Arquitetura**: Migração de modelo `Product` para `Produto` (nomenclatura em português)
- **Frontend**: Atualização de campos de produto para usar nomenclatura em português
  - `name` → `nome`
  - `description` → `descricao`
  - `price` → `preco`
  - `stock` → `quantidadeEstoque`
- **Backend**: Refatoração de controllers para usar modelos em português
- **Backend**: Atualização de repositories para usar tipos enum corretos
- **Backend**: Padronização de nomenclatura de métodos e variáveis

### Fixed
- **Backend**: Erro de compilação devido a referências a classes `Product` inexistentes
- **Backend**: Incompatibilidade de tipos entre `String` e `Produto.ProdutoStatus`
- **Backend**: Falta de endpoints para listagem de produtos e usuários
- **Frontend**: Integração com API real removendo dados mockados
- **Frontend**: Tratamento de erros de autenticação e conexão
- **Frontend**: Validação de permissões para acesso a funcionalidades administrativas

### Removed
- **Backend**: Classe `Product.java` (substituída por `Produto.java`)
- **Backend**: Classe `ProductService.java` (substituída por `ProdutoService.java`)
- **Backend**: Classe `ProductRepository.java` (substituída por `ProdutoRepository.java`)
- **Backend**: Classe `ProductController.java` (substituída por `ProdutoController.java`)
- **Frontend**: Dados mockados hardcoded nos componentes
- **Frontend**: Lógica de autenticação local nos componentes

### Security
- **Backend**: Implementação de autenticação JWT para endpoints protegidos
- **Backend**: Validação de permissões baseada em grupos de usuário
- **Frontend**: Armazenamento seguro de tokens em localStorage
- **Frontend**: Interceptors para renovação automática de autenticação
- **Frontend**: Redirecionamento automático para login em sessões expiradas

## [0.1.0] - 2025-09-03 - Pedro Ibanez

### Added 
- **Projeto**: Estrutura inicial do projeto Goia Shop
- **Backend**: Aplicação Spring Boot com JPA/Hibernate
- **Frontend**: Aplicação React com React Bootstrap
- **Docker**: Configuração de containers para desenvolvimento

