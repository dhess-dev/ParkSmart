package com.example.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.backend.models.ParkingCount;
import com.example.backend.repositories.ParkingCountRepository;
import com.example.backend.services.ParkingCountSseService;

@RestController
@RequestMapping("/api/parkingCount")
public class ParkingCountController {
    private final ParkingCountRepository repository;
    private final ParkingCountSseService sseService;

    public ParkingCountController(ParkingCountRepository repository, ParkingCountSseService sseService) {
        this.repository = repository;
        this.sseService = sseService;
    }

    @GetMapping
    public List<ParkingCount> getAll() {
        return repository.findAllByOrderByDateAsc();
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return sseService.subscribe();
    }

    public void updateParkingCount() {
        List<ParkingCount> updatedParkingCount = getAll();
        sseService.broadcast(updatedParkingCount);
    }
}
