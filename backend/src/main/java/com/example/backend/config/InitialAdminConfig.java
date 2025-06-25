package com.example.backend.config;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.backend.models.GateAccess;
import com.example.backend.models.ParkingSpot;
import com.example.backend.models.ParkingStatus;
import com.example.backend.models.User;
import com.example.backend.repositories.GateAccessRepository;
import com.example.backend.repositories.ParkingSpotRepository;
import com.example.backend.repositories.ParkingStatusRepository;
import com.example.backend.repositories.UserRepository;

@Configuration
public class InitialAdminConfig {

    @Bean
    CommandLineRunner createAdmin(UserRepository userRepository, ParkingSpotRepository parkingSpotRepository, GateAccessRepository gateAccessRepository, ParkingStatusRepository parkingStatusRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@example.com");
                admin.setPassword("admin123"); // Password will be hashed
                admin.setRoles(Set.of("USER", "ADMIN"));

                admin.setFirstName("First");
                admin.setLastName("Last");
                admin.setPhoneNumber("123-456-789");
                admin.setAddress("Teststraße ");
                admin.setCity("City");
                admin.setCountry("Country");
                admin.setPostalCode("1000");
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

                    user.setFirstName("First" + i);
                    user.setLastName("Last" + i);
                    user.setPhoneNumber("123-456-789" + i);
                    user.setAddress("Teststraße " + i);
                    user.setCity("City" + i);
                    user.setCountry("Country" + i);
                    user.setPostalCode("1000" + i);

                    userRepository.save(user);
                    System.out.printf("Created test user: username=%s, email=%s, password=pass%d%n",
                            username, user.getEmail(), i);
                }
            }

            if (parkingSpotRepository.count() == 0) {
                List<String> positions = List.of(
                        "A1", "A2", "A3", "A4"
                );

                for (int i = 0; i < positions.size(); i++) {
                    ParkingSpot spot = new ParkingSpot();
                    spot.setPosition(positions.get(i));
                    parkingSpotRepository.save(spot);
                }
                System.out.println("Seeded " + positions.size());
            } else {
                System.out.println("Parking spots already exist: count="
                        + parkingSpotRepository.count());
            }

            if (gateAccessRepository.count() == 0) {
                GateAccess access = new GateAccess();
                access.setRfidCode("256DA883");
                gateAccessRepository.save(access);
            }

            if (parkingStatusRepository.count() == 0) {
                OffsetDateTime timestamp = OffsetDateTime.now();
                ParkingStatus status = new ParkingStatus();
                status.setFreeSpots(10);
                status.setTimestamp(timestamp);
            }
        };
    }
}
