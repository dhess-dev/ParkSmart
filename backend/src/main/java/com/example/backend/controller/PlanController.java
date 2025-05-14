package com.example.backend.controller;

import com.example.backend.models.Plan;
import com.example.backend.models.User;
import com.example.backend.models.Booking;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.PlanService;
import com.example.backend.services.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/plans")
public class PlanController {

    private final PlanService planService;
    private final UserRepository userRepository;
    private final BookingService bookingService;

    public PlanController(PlanService planService, UserRepository userRepository, BookingService bookingService) {
        this.planService = planService;
        this.userRepository = userRepository;
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<Plan>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Plan> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(planService.getPlanById(id));
    }

    @PostMapping
    public ResponseEntity<Plan> createPlan(@RequestBody Plan plan) {
        return ResponseEntity.ok(planService.createPlan(plan));
    }

    @PostMapping("/purchase")
    public ResponseEntity<String> purchasePlan(@RequestBody Map<String, Long> payload, Authentication authentication) {
        Long planId = payload.get("planId");
        if (planId == null) {
            return ResponseEntity.badRequest().body("Invalid payload: planId is missing");
        }

        String username = authentication.getName();

        
        Plan plan = planService.getPlanById(planId);
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found: " + username);
        }
        User user = optionalUser.get();

       
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setType(plan.getName());
        booking.setStartTime(OffsetDateTime.now());


        if (plan.getDuration() == null || plan.getDuration() == -1) {
            booking.setEndTime(null); 
        } else {
            booking.setEndTime(OffsetDateTime.now().plusDays(plan.getDuration()));
        }

        booking.setQrCodeContent(UUID.randomUUID().toString()); 
        bookingService.createBooking(booking);

        return ResponseEntity.ok("Plan purchased and booking created successfully!");
    }
}