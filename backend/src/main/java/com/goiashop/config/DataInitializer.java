package com.goiashop.config;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.goiashop.model.User;
import com.goiashop.model.Produto;
import com.goiashop.repository.UserRepository;
import com.goiashop.repository.ProdutoRepository;
import com.goiashop.service.PasswordService;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private PasswordService passwordService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 Inicializando dados do sistema...");
        
        // Criar usuário admin se não existir
        createUserIfNotExists(
            "admin@goiashop.com",
            "Administrador Sistema",
            "12345678901",
            "adm123",
            User.UserGroup.ADMIN
        );

        // Criar usuário estoquista se não existir
        createUserIfNotExists(
            "estoquista@goiashop.com",
            "Estoquista Padrão",
            "98765432109",
            "estoque123",
            User.UserGroup.ESTOQUISTA
        );
        
        // Criar produtos mockados para teste
        createProdutosMockados();
        
        System.out.println("✅ Inicialização de dados concluída!");
        System.out.println("📋 Credenciais disponíveis:");
        System.out.println("   👤 Admin: admin@goiashop.com / adm123");
        System.out.println("   📦 Estoquista: estoquista@goiashop.com / estoque123");
    }

    private void createUserIfNotExists(String email, String nome, String cpf, String senha, User.UserGroup grupo) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setNome(nome);
            user.setCpf(cpf);
            user.setSenhaHash(passwordService.encryptPassword(senha)); // BCrypt aqui!
            user.setGrupo(grupo);
            user.setStatus(User.UserStatus.ATIVO);
            
            userRepository.save(user);
            System.out.println("✅ Usuário criado: " + email + " (senha: " + senha + ")");
        } else {
            System.out.println("ℹ️ Usuário já existe: " + email);
        }
    }
    
    private void createProdutosMockados() {
        System.out.println("🛍️ Criando produtos mockados para teste...");
        
        // Verificar se já existem produtos
        if (produtoRepository.count() > 0) {
            System.out.println("ℹ️ Produtos já existem no sistema");
            return;
        }
        
        // Criar produtos de exemplo
        createProdutoIfNotExists("Smartphone Galaxy S23", 
            "Smartphone Samsung Galaxy S23 128GB, Tela 6.1\", Câmera Tripla 50MP, 5G", 
            new BigDecimal("2899.99"), 50);
            
        createProdutoIfNotExists("Notebook Dell Inspiron", 
            "Notebook Dell Inspiron 15 3000, Intel i5, 8GB RAM, SSD 256GB, Tela 15.6\"", 
            new BigDecimal("2499.99"), 25);
            
        createProdutoIfNotExists("Smart TV LG 55\"", 
            "Smart TV LG 55\" 4K UHD, ThinQ AI, WebOS, HDR10, 4 HDMI", 
            new BigDecimal("2199.99"), 15);
            
        createProdutoIfNotExists("Fone Bluetooth AirPods", 
            "Apple AirPods Pro 2ª Geração, Cancelamento Ativo de Ruído, Case MagSafe", 
            new BigDecimal("1899.99"), 30);
            
        createProdutoIfNotExists("Tablet iPad Air", 
            "iPad Air 5ª Geração, Tela 10.9\", Chip M1, 64GB Wi-Fi", 
            new BigDecimal("4199.99"), 20);
            
        createProdutoIfNotExists("Console PlayStation 5", 
            "PlayStation 5 Standard Edition, SSD 825GB, Controle DualSense", 
            new BigDecimal("4599.99"), 10);
            
        createProdutoIfNotExists("Câmera Canon EOS T7", 
            "Câmera Canon EOS Rebel T7, 24.1MP, Kit com Lente 18-55mm", 
            new BigDecimal("1899.99"), 12);
            
        createProdutoIfNotExists("Smartwatch Apple Watch", 
            "Apple Watch Series 8, GPS 45mm, Caixa Alumínio, Pulseira Esportiva", 
            new BigDecimal("3299.99"), 18);
            
        createProdutoIfNotExists("Headset Gamer HyperX", 
            "HyperX Cloud II Gaming Headset, Surround 7.1, Microfone Destacável", 
            new BigDecimal("599.99"), 40);
            
        createProdutoIfNotExists("Monitor Gamer Asus", 
            "Monitor Gamer Asus 24\", Full HD, 144Hz, 1ms, FreeSync Premium", 
            new BigDecimal("1299.99"), 22);
        
        System.out.println("✅ Produtos mockados criados com sucesso!");
    }
    
    private void createProdutoIfNotExists(String nome, String descricao, BigDecimal preco, Integer estoque) {
        Produto produto = new Produto();
        produto.setNome(nome);
        produto.setDescricao(descricao);
        produto.setPreco(preco);
        produto.setQuantidadeEstoque(estoque);
        produto.setStatus(Produto.ProdutoStatus.ATIVO);
        produto.setAvaliacao(4.0 + (Math.random() * 1.0)); // Avaliação entre 4.0 e 5.0
        
        produtoRepository.save(produto);
        System.out.println("📦 Produto criado: " + nome + " - R$ " + preco);
    }
}