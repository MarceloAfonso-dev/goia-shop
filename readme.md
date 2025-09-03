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

- Docker
- MySQL 8.0
- Node.js
- React
- Spring Boot

---

## Configurações Iniciais

### Configuração do Banco de Dados (MySQL)

Para iniciar o banco de dados MySQL usando Docker, siga os passos abaixo:

1. **Pré-requisitos:**
   - Docker Desktop instalado e em execução
   - Docker Compose instalado

2. **Iniciando o Banco de Dados:**
   ```bash
   # No diretório raiz do projeto
   docker compose up -d
   ```

3. **Verificando o Status:**
   ```bash
   docker ps
   ```
   Você deverá ver um container chamado `goia-shop-mysql` em execução.

4. **Credenciais do Banco:**
   - Host: localhost
   - Porta: 3306
   - Usuário: goia
   - Senha: goia123
   - Banco de Dados: BancoGOIA

5. **Parando o Banco de Dados:**
   ```bash
   docker compose down
   ```

6. **Visualizando Logs:**
   ```bash
   docker logs goia-shop-mysql
   ```

O banco de dados já vem configurado com todas as tabelas necessárias para o sistema, incluindo:
- Gerenciamento de usuários (ADMIN/ESTOQUISTA)
- Produtos
- Sessões
- Logs de auditoria

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

<p align="center">
  <img 
    src="https://capsule-render.vercel.app/api?type=waving&color=ff69b4&height=80&section=footer"
    width="100%" 
  />
</p>
