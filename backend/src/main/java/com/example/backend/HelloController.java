package com.example.backend;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

    @CrossOrigin(origins = "http://localhost:5173")
    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of("message", "Hello from Spring!");
    }
}
