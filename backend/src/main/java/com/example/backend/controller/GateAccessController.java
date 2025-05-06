package com.example.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.models.GateAccess;
import com.example.backend.repositories.GateAccessRepository;

@RestController
@RequestMapping("/api/gateAccess")
public class GateAccessController {

    private final GateAccessRepository repository;

    public GateAccessController(GateAccessRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<GateAccess> getAllCards() {
        return repository.findAll();
    }

    @GetMapping("/{rfidCode}")
    public GateAccess getCardByRfidCode(@PathVariable String rfidCode) {
        return repository.findByRfidCode(rfidCode).orElse(null);
    }

    @PostMapping
    public GateAccess createCard(@RequestBody GateAccess gateAccess) {
        return repository.save(gateAccess);
    }
}
