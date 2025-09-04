# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

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


