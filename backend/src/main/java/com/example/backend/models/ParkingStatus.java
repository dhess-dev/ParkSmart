package com.example.backend.models;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "parking_status")
public class ParkingStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  
    private Long id; 

    @Column(nullable = false, updatable = false)
    private OffsetDateTime timestamp;

    private long freeSpots;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public long getFreeSpots() {
        return freeSpots;
    }

    public void setFreeSpots(long freeSpots) {
        this.freeSpots = freeSpots;
    }
}
