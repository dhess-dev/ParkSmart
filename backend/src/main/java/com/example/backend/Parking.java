package com.example.backend;

public class Parking {

    private String identificationCode;
    private boolean spotOccupied;
    private boolean entryGateOpened;
    private boolean exitGateOpened;

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
