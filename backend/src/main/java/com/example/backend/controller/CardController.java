package com.example.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.models.Card;
import com.example.backend.repositories.CardRepository;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardRepository repository;

    public CardController(CardRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Card> getAllCards() {
        return repository.findAll();
    }

    @GetMapping("/{cardCode}")
    public Card getCardByCardCode(@PathVariable String cardCode) {
        return repository.findByCardCode(cardCode).orElse(null);
    }

    @PostMapping
    public Card createCard(@RequestBody Card card) {
        return repository.save(card);
    }
}
