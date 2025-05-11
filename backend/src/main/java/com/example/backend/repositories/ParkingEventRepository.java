package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.models.ParkingEvent;

@Repository
public interface ParkingEventRepository extends JpaRepository<ParkingEvent, Long> {

}
