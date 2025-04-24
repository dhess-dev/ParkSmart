package com.example.backend.controllers;

import com.example.backend.models.Card;
import com.example.backend.repositories.CardRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
public class CardController {
    private final CardRepository repository;

    public CardController(CardRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Card> getAllUsers() {
        return repository.findAll();
    }

    @PostMapping
    public Card createCard(@RequestBody Card card) {
        return repository.save(card);
    }   
}
