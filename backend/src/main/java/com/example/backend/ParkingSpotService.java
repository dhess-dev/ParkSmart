package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.models.ParkingSpot;
import com.example.backend.repositories.ParkingSpotRepository;

@Service
public class ParkingSpotService {

    @Autowired
    private ParkingSpotRepository parkingSpotRepository;

    @Transactional
    public void updateSpotOccupancy(float distance) {
        System.out.println("ewqewqewq");
        boolean isOccupied = distance <= 5;

        ParkingSpot spot = parkingSpotRepository.findById(1L).orElse(null);
        if (spot == null) {
            spot = new ParkingSpot();
            spot.setId(1L);
        }

        spot.setIsOccupied(isOccupied);
        parkingSpotRepository.save(spot);
    }
}
