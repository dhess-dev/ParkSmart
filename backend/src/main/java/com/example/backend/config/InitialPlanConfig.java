package com.example.backend.config;

import com.example.backend.models.Plan;
import com.example.backend.repositories.PlanRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class InitialPlanConfig {

    @Bean
    CommandLineRunner seedPlans(PlanRepository planRepository) {
        return args -> {
            if (planRepository.count() == 0) {
                planRepository.save(new Plan("Daily Parking", "Access for one day", 10.0, 1));
                planRepository.save(new Plan("Monthly Parking", "Unlimited access for one month", 100.0, 30));
                planRepository.save(new Plan("Annual Parking", "Unlimited access for one year", 1000.0, 365));
                planRepository.save(new Plan("Unlimited Parking", "Unlimited access with no expiration", 5000.0, null));
            }
        };
    }
}