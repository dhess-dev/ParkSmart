package com.example.backend.services;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.backend.models.ParkingCount;
import com.example.backend.models.ParkingEvent;
import com.example.backend.models.ParkingStatus;
import com.example.backend.mqtt.ClientManager;
import com.example.backend.repositories.ParkingCountRepository;
import com.example.backend.repositories.ParkingEventRepository;
import com.example.backend.repositories.ParkingStatusRepository;

@Service
@EnableScheduling
public class ParkingService {

    private String identificationCode;
    private boolean spotOccupied;
    private boolean entryGateOpened;
    private boolean exitGateOpened;

    private final ParkingEventRepository parkingEventRepository;
    private final ParkingCountRepository parkingCountRepository;
    private final ParkingStatusRepository parkingStatusRepository;

    @Autowired
    @Lazy
    private ClientManager mqttClientManager;


    public ParkingService(ParkingEventRepository parkingEventRepository, ParkingCountRepository parkingCountRepository, ParkingStatusRepository parkingStatusRepository) {
        this.parkingEventRepository = parkingEventRepository;
        this.parkingCountRepository = parkingCountRepository;
        this.parkingStatusRepository = parkingStatusRepository;
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void dailyScheduler() {
        LocalDate date = LocalDate.now();
        ParkingCount parkingCount = new ParkingCount();
        parkingCount.setCarsInParking(0);
        parkingCount.setDate(date);
        parkingCountRepository.save(parkingCount);
        parkingEventRepository.deleteAll();
    }

    public void updateParkingCount() {
        LocalDate date = LocalDate.now();
        ParkingCount parkingCount = parkingCountRepository.findByDate(date).orElse(new ParkingCount());
        if (parkingCount.getId() == null) {
            parkingCount.setCarsInParking(1);
            parkingCount.setDate(date);
            parkingCountRepository.save(parkingCount);
        } else {
            long currentCarsInParking = parkingCount.getCarsInParking();
            long newCarsInParking = currentCarsInParking + 1;
            parkingCountRepository.updateCarCountByDate(date, newCarsInParking);
        }
    }

    public void createParkingStatusEntry(String eventType) {
        int freeParkingSpots = parkingStatusRepository.getLatestParkingSpots();
        int summand = switch (eventType) {
            case "exit" ->
                1;
            case "entry" ->
                -1;
            default ->
                0;
        };

        int newFreeParkingSpots = freeParkingSpots + summand;

        ParkingStatus status = new ParkingStatus();
        status.setFreeSpots(newFreeParkingSpots);
        status.setTimestamp(OffsetDateTime.now());
        
        mqttClientManager.publishMessage("cps/parking/spots/count", String.valueOf(newFreeParkingSpots));
        
        parkingStatusRepository.save(status);
    }

    public void logParkingEvent(String eventType) {
        ParkingEvent event = new ParkingEvent();
        event.setTimestamp(OffsetDateTime.now());
        event.setEvent(eventType);
        parkingEventRepository.save(event);
    }

    public String getIdentificationCode() {
        return identificationCode;
    }

    public void setIdentificationCode(String identificationCode) {
        this.identificationCode = identificationCode;
    }

    public boolean isSpotOccupied() {
        return spotOccupied;
    }

    public void setSpotOccupied(boolean spotOccupied) {
        this.spotOccupied = spotOccupied;
    }

    public boolean isEntryGateOpened() {
        return entryGateOpened;
    }

    public void setEntryGateOpened(boolean entryGateOpened) {
        this.entryGateOpened = entryGateOpened;
    }

    public boolean isExitGateOpened() {
        return exitGateOpened;
    }

    public void setExitGateOpened(boolean exitGateOpened) {
        this.exitGateOpened = exitGateOpened;
    }
}
