package com.example.backend.repositories;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.models.Booking;
import com.example.backend.models.User;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserOrderByStartTimeDesc(User user);

    Optional<Booking> findByQrCodeContent(String qrCodeContent);

    int countByEndTimeAfter(OffsetDateTime time);
}