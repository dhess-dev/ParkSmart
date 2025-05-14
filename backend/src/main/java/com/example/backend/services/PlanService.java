package com.example.backend.services;

import com.example.backend.models.Plan;
import com.example.backend.repositories.PlanRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlanService {

    private final PlanRepository planRepository;

    public PlanService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }

    public Plan getPlanById(Long id) {
        return planRepository.findById(id).orElseThrow(() -> new RuntimeException("Plan not found"));
    }

    public Plan createPlan(Plan plan) {
        return planRepository.save(plan);
    }
}