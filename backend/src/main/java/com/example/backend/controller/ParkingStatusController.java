package com.example.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.models.ParkingStatus;
import com.example.backend.repositories.ParkingStatusRepository;


@RestController
@RequestMapping("/api/parking-status")
public class ParkingStatusController {
    private final ParkingStatusRepository repository;

    public ParkingStatusController (ParkingStatusRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ParkingStatus> getAll() {
        return repository.findAllByOrderByTimestampAsc();
    }

    public void updateParkingStatus() {
        
    }

}
