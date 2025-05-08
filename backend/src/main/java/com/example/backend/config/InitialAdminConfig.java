package com.example.backend.config;

import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Set;

@Configuration
public class InitialAdminConfig {

    @Bean
    CommandLineRunner createAdmin(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@example.com");
                admin.setPassword("admin123"); // Password will be hashed
                admin.setRoles(Set.of("USER", "ADMIN"));
                userRepository.save(admin);
                System.out.println("Admin account created: username=admin, password=admin123");
            }

            for (int i = 1; i <= 10; i++) {
                String username = String.format("user%d", i);
                if (userRepository.findByUsername(username).isEmpty()) {
                    User user = new User();
                    user.setUsername(username);
                    user.setEmail(String.format("user%d@example.com", i));
                    user.setPassword(String.format("pass%d", i)); // will get BCrypt-hashed
                    user.setRoles(Set.of("USER"));
                    userRepository.save(user);
                    System.out.println(
                            String.format("Created test user: username=%s, email=%s, password=pass%d",
                                    username, username + "@example.com", i)
                    );
                }
            }
        };
    }
}
