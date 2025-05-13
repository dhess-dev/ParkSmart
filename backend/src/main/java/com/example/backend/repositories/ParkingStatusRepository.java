package com.example.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.models.ParkingStatus;

@Repository
public interface ParkingStatusRepository extends JpaRepository<ParkingStatus, Long> {
    List<ParkingStatus> findAllByOrderByTimestampAsc();
}
