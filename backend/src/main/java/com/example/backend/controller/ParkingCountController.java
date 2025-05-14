package com.example.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.models.ParkingCount;
import com.example.backend.repositories.ParkingCountRepository;

@RestController
@RequestMapping("/api/parking-count")
public class ParkingCountController {
    private final ParkingCountRepository repository;

    public ParkingCountController(ParkingCountRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ParkingCount> getAll() {
        return repository.findAllByOrderByDateAsc();
    }
}
