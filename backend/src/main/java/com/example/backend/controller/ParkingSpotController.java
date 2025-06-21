package com.example.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.backend.models.ParkingSpot;
import com.example.backend.repositories.ParkingSpotRepository;
import com.example.backend.services.ParkingSpotSseService;

@RestController
@RequestMapping("api/parkingSpot")
public class ParkingSpotController {

    private final ParkingSpotRepository repository;
    private final ParkingSpotSseService parkingSpotSseService;

    public ParkingSpotController(ParkingSpotRepository repository, ParkingSpotSseService parkingSpotSseService) {
        this.repository = repository;
        this.parkingSpotSseService = parkingSpotSseService;
    }

    @GetMapping
    public List<ParkingSpot> getAllParkingSpots() {
        return repository.findAll();
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return parkingSpotSseService.subscribe();
    }

    public ParkingSpot updateSpot(@PathVariable String position) {
        ParkingSpot spot = repository.findByPosition(position).orElseThrow(() -> new RuntimeException("Not found"));
        spot.setOccupied(!spot.isOccupied());
        ParkingSpot updatedSpot = repository.save(spot);
        parkingSpotSseService.broadcast(repository.findAll());
        return updatedSpot;
    }

    public ParkingSpot getParkingSpotByPosition(String position) {
        return repository.findByPosition(position).orElse(null);
    }

}

