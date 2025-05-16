package com.example.backend.services;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.backend.controller.ParkingSpotController;
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
    private boolean spotA1Occupied;
    private boolean spotA2Occupied;
    private boolean entryGateOpened;
    private boolean exitGateOpened;

    @Autowired
    @Lazy
    private ClientManager mqttClientManager;

    private final ParkingEventRepository parkingEventRepository;
    private final ParkingCountRepository parkingCountRepository;
    private final ParkingStatusRepository parkingStatusRepository;
    private final ParkingSpotController parkingSpotController;
    private final int PARKING_SPOT_OCCUPIED_DISTANCE = 5;

    public ParkingService(
            ParkingEventRepository parkingEventRepository,
            ParkingCountRepository parkingCountRepository,
            ParkingStatusRepository parkingStatusRepository,
            ParkingSpotController parkingSpotController) {

        this.parkingEventRepository = parkingEventRepository;
        this.parkingCountRepository = parkingCountRepository;
        this.parkingStatusRepository = parkingStatusRepository;
        this.parkingSpotController = parkingSpotController;
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
        ParkingCount parkingCount = parkingCountRepository.findByDate(date).orElse(null);
        if (parkingCount == null || parkingCount.getId() == null) {
            parkingCount = new ParkingCount();
            parkingCount.setCarsInParking(1);
            parkingCount.setDate(date);
            parkingCountRepository.save(parkingCount);
        } else {
            long newCarsInParking = parkingCount.getCarsInParking() + 1;
            parkingCountRepository.updateCarCountByDate(date, newCarsInParking);
        }
    }

    public void handleSpotDistanceUpdate(String spotId, MqttMessage message) {
        String payload = new String(message.getPayload());
        float distance;

        try {
            distance = Float.parseFloat(payload);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid distance payload: " + payload);
        }

        boolean isOccupied = distance <= PARKING_SPOT_OCCUPIED_DISTANCE;
        boolean currentStatus;

        switch (spotId) {
            case "A1" -> currentStatus = spotA1Occupied;
            case "A2" -> currentStatus = spotA2Occupied;
            default -> throw new IllegalArgumentException("Unknown spot ID: " + spotId);
        }

        if (isOccupied != currentStatus) {
            switch (spotId) {
                case "A1" -> setSpotA1Occupied(isOccupied);
                case "A2" -> setSpotA2Occupied(isOccupied);
            }

            parkingSpotController.updateSpot(spotId);
            System.out.println("cps/parking/spot/" + spotId + "/isOccupied");
            mqttClientManager.publishMessage("cps/parking/spot/" + spotId + "/isOccupied", isOccupied ? "1" : "0");
        }
    }

    public void createParkingStatusEntry(String eventType) {
        int freeParkingSpots = parkingStatusRepository.getLatestParkingSpots();
        int summand = switch (eventType) {
            case "exit" -> 1;
            case "entry" -> -1;
            default -> 0;
        };

        int newFreeParkingSpots = freeParkingSpots + summand;

        ParkingStatus status = new ParkingStatus();
        status.setFreeSpots(newFreeParkingSpots);
        status.setTimestamp(OffsetDateTime.now());

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

    public boolean isSpotA1Occupied() {
        return spotA1Occupied;
    }

    public void setSpotA1Occupied(boolean spotA1Occupied) {
        this.spotA1Occupied = spotA1Occupied;
    }

    public boolean isSpotA2Occupied() {
        return spotA2Occupied;
    }

    public void setSpotA2Occupied(boolean spotA2Occupied) {
        this.spotA2Occupied = spotA2Occupied;
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