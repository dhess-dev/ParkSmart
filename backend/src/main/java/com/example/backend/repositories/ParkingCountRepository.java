package com.example.backend.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.models.ParkingCount;

import jakarta.transaction.Transactional;

public interface ParkingCountRepository extends JpaRepository<ParkingCount, Long> {

    List<ParkingCount> findAllByOrderByDateAsc();

    Optional<ParkingCount> findByDate(LocalDate date);

    @Modifying
    @Transactional
    @Query("UPDATE ParkingCount p SET p.carsInParking = :newCarsInParking WHERE p.date = :date")
    void updateCarCountByDate(@Param("date") LocalDate date, @Param("newCarsInParking") long newCarsInParking);
}
