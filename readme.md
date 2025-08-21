<a href="#">
  <img 
    width="100%" 
    src="https://capsule-render.vercel.app/api?type=waving&color=ff69b4&height=120&section=header&text=&fontSize=30&fontColor=000000&animation=twinkling"
  />
</a>

<p align="center">
  <img 
    src="https://cdn3d.iconscout.com/3d/premium/thumb/java-file-3d-icon-download-in-png-blend-fbx-gltf-formats--logo-extension-format-pack-files-folders-icons-5607407.png" 
    alt="Logo SQL"
    width="300px"
  />
</p>

# Banco GOI

Este projeto representa a estrutura e funcionamento do Banco GOI, incluindo serviços financeiros e produtos bancários. Além disso, descrevemos a organização do time (Squad) responsável pelo desenvolvimento.

### O Banco GOI possui as seguintes funcionalidades:

📂 Conta Corrente Serviços  
📥 Depositar  
🔄 Transferir  
💳 Cheque Especial  
🏦 Cartão de Crédito  
📈 CDBs  

---

### ✨ O que já está funcionando no Banco GOI?

Atualmente, os usuários do Banco GOI podem:

🔄 Realizar transferências para outras contas  
📄 Consultar o extrato bancário com o histórico de movimentações  

Essas funcionalidades já estão ativas e testadas, garantindo o básico para uma experiência bancária digital.

---

### 🔮 O que vem por aí?

O projeto Banco GOI está em constante evolução! Já estamos planejando as próximas melhorias, como:

📈 **CDB Incentivado SG**: Um tipo de investimento com alto rendimento, criado para quem deseja fazer o dinheiro render de forma segura e prática.  
📄 **Pagamento de boletos do Senac**: Para facilitar a vida do aluno, será possível pagar mensalidades e outros boletos diretamente pelo sistema.  
💳 **Solicitação de Cartão de Crédito**: Os usuários poderão solicitar um cartão virtual ou físico com controle total pela plataforma.

---

### O time de desenvolvimento está dividido em quatro áreas principais:

- **Backend** ⚙️ (Marcelo Afonso, Italo Silva e Gustavo)  
- **Frontend** 🎨 (Maycon Daynor, Gustavo)  
- **Banco de Dados** 🗄️ (Marcelo Afonso, Italo Silva, Gustavo Mendes)  
- **Infraestrutura** 🛠️ (Marcelo Afonso)
- **IA** 🛠️ (Gustavo)  

Cada área tem a responsabilidade de desenvolver e manter suas respectivas partes do sistema.

---

### Tecnologias Utilizadas:

- **Backend**: Java  
- **Frontend**: HTML, CSS, JavaScript  
- **Banco de Dados**: MySQL  
- **Cloud**: AWS RDS MySQL  

---

## Configurações Iniciais

1. Baixe as dependências no Maven  
2. Configure a JDK 17 ou 21  
3. Acrescente a pasta `resources` dentro de `main` (ao lado de `java`) com as credenciais de conexão ao banco:

   ```
   db.url=jdbc:mysql://goi-database.cjsxgdipkurd.us-east-1.rds.amazonaws.com:3306/goi-database  
   db.user=admin  
   db.password=SENAC2005$
   ```

4. Acesse via `localhost:8080`

---

### Credenciais de Teste

#### Usuário A
- CPF: 12345678901  
- Senha: 123456  

#### Usuário B
- CPF: 98765432196  
- Senha: 124578  

---

## Prototipagem

Nesta seção, apresentamos as imagens das prototipagens do projeto. As imagens foram geradas para auxiliar no desenvolvimento e na validação das interfaces do sistema. Elas estão armazenadas no repositório, no diretório `./Prototipagens`.

### 1. Tela Inicial  
![Landing Page](./Prototipagens/landing-page.png)  
*Figura 1: Feito por Maycol e Gustavo*

### 2. Tela de Login  
![Login](./Prototipagens/login.png)  
*Figura 2: Feito por Marcelo*

### 3. Tela de Cadastro  
![Cadastro](./Prototipagens/casdastro.png)  

### 4. Tela Menu Logado  
![Menu](./Prototipagens/menu-logado.png)  

### 5. Tela de Extrato da Conta  
![Extrato](./Prototipagens/extrato-conta.png)  

### 6. Tela de Cartão Específico  
![Cartão](./Prototipagens/cartao-especifico.png)  

### 7. Tela de Pagamento de Fatura  
![Pagamento](./Prototipagens/pagamento-fatura.png)  

---

<p align="center">
  <img 
    src="https://capsule-render.vercel.app/api?type=waving&color=ff69b4&height=80&section=footer"
    width="100%" 
  />
</p>
