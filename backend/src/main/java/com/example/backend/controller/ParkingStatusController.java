package com.example.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.backend.models.ParkingStatus;
import com.example.backend.repositories.ParkingStatusRepository;
import com.example.backend.services.ParkingStatusSseService;

@RestController
@RequestMapping("/api/parkingStatus")
public class ParkingStatusController {
    private final ParkingStatusRepository repository;
    private final ParkingStatusSseService sseService;


    public ParkingStatusController (ParkingStatusRepository repository, ParkingStatusSseService sseService) {
        this.repository = repository;
        this.sseService = sseService;
    }

    @GetMapping
    public List<ParkingStatus> getAll() {
        return repository.findAllByOrderByTimestampAsc();
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return sseService.subscribe();
    }

    public void updateParkingStatus() {
        List<ParkingStatus> updatedParkingStatus = repository.findAllByOrderByTimestampAsc();
        sseService.broadcast(updatedParkingStatus);
    }

}
