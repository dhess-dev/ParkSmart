package com.example.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.models.ParkingSpot;
import com.example.backend.repositories.ParkingSpotRepository;

@RestController
@RequestMapping("api/parkingSpot")
public class ParkingSpotController {

    private final ParkingSpotRepository repository;

    public ParkingSpotController(ParkingSpotRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ParkingSpot> getAllParkingSpots() {
        return repository.findAll();
    }
}
