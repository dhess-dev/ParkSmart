package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.models.ParkingEvent;

@Repository
public interface ParkingEventRepository extends JpaRepository<ParkingEvent, Long> {

    @Query("SELECT COUNT(ep) FROM ParkingEvent ep WHERE ep.event = :event")
    long countByEvent(@Param("event") String event);
}
