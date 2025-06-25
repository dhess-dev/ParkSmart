package com.example.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.backend.models.Plan;
import com.example.backend.repositories.PlanRepository;

@Configuration
public class InitialPlanConfig {

    @Bean
    CommandLineRunner seedPlans(PlanRepository planRepository) {
        return args -> {
            if (planRepository.count() == 0) {
                planRepository.save(new Plan("Tagespass", "Zugang für einen Tag", 29.99, 1));
                planRepository.save(new Plan("Monatspass", "Unbegrenzter Zugang für einen Monat", 129.99, 30));
                planRepository.save(new Plan("Jahrespass", "Unbegrenzter Zugang für ein Jahr", 999.99, 365));
            }
        };
    }
}