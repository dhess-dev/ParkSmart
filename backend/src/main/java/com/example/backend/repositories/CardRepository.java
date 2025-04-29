package com.example.backend.repositories;

import com.example.backend.models.Card;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, Long> {

    Optional<Card> findByCardCode(String cardCode);
}
