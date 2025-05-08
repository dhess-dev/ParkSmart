package com.example.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @GetMapping("/stats")
    public Map<String, Object> adminStats() {
        // only ADMINs can ever reach here
        return Map.of("uptime", System.currentTimeMillis());
    }
}

