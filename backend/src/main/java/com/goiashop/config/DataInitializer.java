package com.goiashop.config;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.goiashop.model.User;
import com.goiashop.repository.UserRepository;
import com.goiashop.service.PasswordService;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

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
}