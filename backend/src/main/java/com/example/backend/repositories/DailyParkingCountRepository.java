package com.example.backend.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.models.DailyParkingCount;

import jakarta.transaction.Transactional;

public interface DailyParkingCountRepository extends JpaRepository<DailyParkingCount, Long> {
    List<DailyParkingCount> findAllByOrderByDateAsc();

    Optional<DailyParkingCount> findByDate(LocalDate date);

    @Modifying
    @Transactional
    @Query("UPDATE DailyParkingCount d SET d.carsInParking = :newCarsInParking WHERE d.date = :date")
    void updateCarCountByDate(@Param("date") LocalDate date, @Param("newCarsInParking") long newCarsInParking);
}
