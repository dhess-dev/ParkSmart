package com.example.backend.config;

import com.example.backend.models.GateAccess;
import com.example.backend.models.ParkingSpot;
import com.example.backend.models.User;
import com.example.backend.repositories.GateAccessRepository;
import com.example.backend.repositories.ParkingSpotRepository;
import com.example.backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Set;

@Configuration
public class InitialAdminConfig {

    @Bean
    CommandLineRunner createAdmin(UserRepository userRepository, ParkingSpotRepository parkingSpotRepository, GateAccessRepository gateAccessRepository) {
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
            if (parkingSpotRepository.count() == 0) {
                List<String> positions = List.of(
                        "A1", "A2", "A3", "A4", "A5",
                        "B1", "B2", "B3", "B4", "B5"
                );

                for (int i = 0; i < positions.size(); i++) {
                    ParkingSpot spot = new ParkingSpot();
                    spot.setPosition(positions.get(i));
                    spot.setOccupied(i != 0);
                    parkingSpotRepository.save(spot);
                }
                System.out.println("Seeded " + positions.size() + " parking spots (only A1 is free).");
            } else {
                System.out.println("Parking spots already exist: count=" +
                        parkingSpotRepository.count());
            }

            if (gateAccessRepository.count() == 0) {
                GateAccess access = new GateAccess();
                access.setQrCodeContent("5769b876-b5d1-4f80-8bbb-cd4561ba56a6");
                access.setRfidCode("256DA883");
                gateAccessRepository.save(access);
            }
        };
    }
}

