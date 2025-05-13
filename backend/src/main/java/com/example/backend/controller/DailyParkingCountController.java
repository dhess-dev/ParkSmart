package com.example.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.models.DailyParkingCount;
import com.example.backend.repositories.DailyParkingCountRepository;

@RestController
@RequestMapping("/api/daily-parking-counts")
public class DailyParkingCountController {
    private final DailyParkingCountRepository repository;

    public DailyParkingCountController(DailyParkingCountRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<DailyParkingCount> getAll() {
        return repository.findAllByOrderByDateAsc();
    }

}
