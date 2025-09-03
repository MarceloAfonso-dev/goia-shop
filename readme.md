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

# GOIA Shop

Este projeto representa a estrutura e funcionamento da loja e-commerce GOIA Shop. Nesse readme, além de documentar o projeto, fornece informações de desenvolvimento e squad 

### O GOIA Shop possui os seguintes produtos:

📂 Conta Corrente Serviços  


---

### ✨ O que já está funcionando no Banco GOI?

Atualmente, os usuários do Banco GOI podem: 

Essas funcionalidades já estão ativas e testadas, garantindo o básico para uma experiência bancária digital.

---

### 🔮 O que vem por aí?

O projeto GOIA Shop está em constante evolução! Já estamos planejando as próximas melhorias, como:

---

### O time de desenvolvimento está dividido em quatro áreas principais: 

Cada área tem a responsabilidade de desenvolver e manter suas respectivas partes do sistema.

---

### Tecnologias Utilizadas:

---

## Configurações Iniciais

---

### Credenciais de Teste no Sistema Legado

#### Usuário A
- CPF: 12345678901  
- Senha: 123456  

#### Usuário B
- CPF: 98765432196  
- Senha: 124578  

---

## Prototipagem

Nesta seção, apresentamos as imagens das prototipagens do projeto. As imagens foram geradas para auxiliar no desenvolvimento e na validação das interfaces do sistema. Elas estão armazenadas no repositório, no diretório `./Prototipagens`.


---

## E-commerce Backoffice System

### Database Setup

The repository now includes a complete Docker-based MySQL setup for the e-commerce backoffice system alongside the existing banking system schema.

#### Quick Start

1. **Start the database:**
   ```bash
   docker compose up -d
   ```

2. **Database connection details:**
   - Host: localhost
   - Port: 3306
   - Database: appdb
   - Username: app
   - Password: app123

3. **Stop the database:**
   ```bash
   docker compose down
   ```

#### Database Schema

The setup includes:
- **Users table**: For backoffice authentication and user management
  - Supports ADMIN and ESTOQUISTA user groups
  - ATIVO/INATIVO status management
  - BCrypt password hashing (of SHA-256 client hash)
  - CPF and email uniqueness constraints

#### Application Integration

The database is designed to support a Spring Boot application with:
- User authentication and session management
- Role-based access control (ADMIN/ESTOQUISTA)
- User CRUD operations with proper validation
- Automatic user seeding on first startup

#### Preset Users (to be created by application startup)

The application should create these users on first run:
- `admin@demo.com` / `Admin123!` → ADMIN, ATIVO
- `estoquista@demo.com` / `Estoque123!` → ESTOQUISTA, ATIVO
- `inativo@demo.com` / `Inativo123!` → ADMIN, INATIVO (optional for testing)

---

<p align="center">
  <img 
    src="https://capsule-render.vercel.app/api?type=waving&color=ff69b4&height=80&section=footer"
    width="100%" 
  />
</p>
