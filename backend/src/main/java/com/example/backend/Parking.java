package com.example.backend;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.backend.models.DailyParkingCount;
import com.example.backend.models.ParkingEvent;
import com.example.backend.models.ParkingStatus;
import com.example.backend.repositories.DailyParkingCountRepository;
import com.example.backend.repositories.ParkingEventRepository;
import com.example.backend.repositories.ParkingStatusRepository;

@Service
@EnableScheduling
public class Parking {

    private String identificationCode;
    private boolean spotOccupied;
    private boolean entryGateOpened;
    private boolean exitGateOpened;

    private final ParkingEventRepository parkingEventRepository;
    private final DailyParkingCountRepository dailyParkingCountRepository;

    @Autowired
    private ParkingStatusRepository parkingStatusRepository;

    public Parking(ParkingEventRepository parkingEventRepository, DailyParkingCountRepository dailyParkingCountRepository) {
        this.parkingEventRepository = parkingEventRepository;
        this.dailyParkingCountRepository = dailyParkingCountRepository;
    }

    public long calculateFreeParkingSpots() {
        long entryCount = parkingEventRepository.countByEvent("entry");
        long exitCount = parkingEventRepository.countByEvent("exit");
        long capacity = entryCount - exitCount;
        return Math.max(10 - capacity, 0);
    }

    public long calculateTotalCars() {
        long totalCarsPerDay = parkingEventRepository.countByEvent("entry");
        return totalCarsPerDay;
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void dailyScheduler() {
        parkingEventRepository.deleteAll();
    }

    public void updateParkingCountEntry() {
        long totalCarsPerDay = calculateTotalCars();
        LocalDate date = LocalDate.now();  

        if (dailyParkingCountRepository.findByDate(date).isEmpty()) {
            DailyParkingCount dailyParkingCount = new DailyParkingCount();
            dailyParkingCount.setCarsInParking(totalCarsPerDay);
            dailyParkingCount.setDate(date);  
            dailyParkingCountRepository.save(dailyParkingCount); 
        } else {
            dailyParkingCountRepository.updateCarCountByDate(date, totalCarsPerDay);
        }
    }

    public void createParkingStatusEntry() {
        long freeParkingSpots = calculateFreeParkingSpots();
        ParkingStatus status = new ParkingStatus();
        OffsetDateTime timestamp = OffsetDateTime.now();
        status.setFreeSpots(freeParkingSpots) ;
        status.setTimestamp(timestamp);
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