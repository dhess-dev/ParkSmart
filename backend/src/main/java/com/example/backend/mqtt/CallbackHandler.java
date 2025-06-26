package com.example.backend.mqtt;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.example.backend.controller.GateAccessController;
import com.example.backend.controller.ParkingStatusController;
import com.example.backend.models.Booking;
import com.example.backend.services.BookingService;
import com.example.backend.services.ParkingService;

@Component
public class CallbackHandler implements MqttCallback {

    private static final Logger logger = LoggerFactory.getLogger(CallbackHandler.class);

    private final GateAccessController gateAccessController;
    private final BookingService bookingService;
    private final ParkingService parkingService;
    private final ParkingStatusController parkingStatusController;

    private ClientManager mqttClientManager;

    public CallbackHandler(GateAccessController gateAccessController, ParkingService parkingService, BookingService bookingService, ParkingStatusController parkingStatusController) {
        this.gateAccessController = gateAccessController;
        this.parkingService = parkingService;
        this.bookingService = bookingService;
        this.parkingStatusController = parkingStatusController;
    }

    @Autowired
    public void setClientManager(@Lazy ClientManager mqttClientManager) {
        this.mqttClientManager = mqttClientManager;
    }

    @Override
    public void connectionLost(Throwable cause) {
        logger.warn("Connection to MQTT broker lost: {}", cause.getMessage());
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        mqttClientManager.handleReceivedMessage(topic, message);
        String payload = new String(message.getPayload(), StandardCharsets.UTF_8);        
        switch (topic) {
            case "backend/parking/gate/validation/rfid" -> {
                String cardCode = payload;
                if (gateAccessController.getGateAccessByRfidCode(cardCode) != null) {
                    if (!parkingService.isEntryGateOpened()) {
                        if (parkingStatusController.getLatest().getFreeSpots() > 0) {
                            parkingService.setIdentificationCode(cardCode);
                            parkingService.setEntryGateOpened(true);
                            mqttClientManager.publishMessage("cps/parking/gate/entry/open", "1");
                        } else mqttClientManager.publishMessage("cps/parking/full", "1");
                    }
                } else mqttClientManager.publishMessage("cps/parking/gate/validation/rfid/error", "1");
            }

            case "backend/parking/gate/validation/qrCode" -> {
                String qrCode = payload;
                Booking booking = bookingService.getBookingByQrCode(qrCode);

                if (booking == null) {
                    mqttClientManager.publishMessage("cps/parking/gate/validation/qrCode/error", "1");
                    break;
                }

                if (booking.getEndTime().isBefore(OffsetDateTime.now())) {
                    mqttClientManager.publishMessage("cps/parking/gate/validation/qrCode/expired", "1");
                    break;
                }

                if (parkingService.isEntryGateOpened()) {
                    break;
                }

                if (parkingStatusController.getLatest().getFreeSpots() > 0) {
                    parkingService.setEntryGateOpened(true);
                    parkingService.setIdentificationCode(qrCode);
                    mqttClientManager.publishMessage("cps/parking/gate/entry/open", "1");
                } else {
                    mqttClientManager.publishMessage("cps/parking/full", "1");
                }
            }

            case "backend/parking/distance/spot/A1" -> parkingService.handleSpotDistanceUpdate("A1", message);

            case "backend/parking/distance/spot/A2" -> parkingService.handleSpotDistanceUpdate("A2", message);

            case "backend/parking/distance/spot/A3" -> parkingService.handleSpotDistanceUpdate("A3", message);
            
            case "backend/parking/distance/spot/A4" -> parkingService.handleSpotDistanceUpdate("A4", message);

            case "backend/parking/distance/gate" -> {
                float distanceEntryGate = Float.parseFloat(payload);           
                if ((distanceEntryGate <= 5) && parkingService.isEntryGateOpened()) {
                    String eventType = "entry";
                    mqttClientManager.publishMessage("cps/parking/gate/entry/open", "0");
                    parkingService.setEntryGateOpened(false);
                    parkingService.createParkingStatusEntry(eventType);
                    parkingService.updateParkingCount();
                }
            }

            case "backend/parking/distance/close/exitGate" -> {
                float distanceExitGate = Float.parseFloat(payload);           
                boolean isCarInRange = distanceExitGate < 6;
                if (isCarInRange && parkingService.isExitGateOpened()) {
                    parkingService.setExitGateOpened(false);
                    mqttClientManager.publishMessage("cps/parking/gate/exit/open", "0");
                }
            }

            case "backend/parking/distance/open/exitGate" -> {
                float distanceExitGate = Float.parseFloat(payload);           
                boolean isCarInRange = distanceExitGate < 6;
                if (isCarInRange && !parkingService.isExitGateOpened()) {
                    parkingService.setExitGateOpened(true);
                    mqttClientManager.publishMessage("cps/parking/gate/exit/open", "1");
                }
            }

            case "backend/parking/gate/exit/open" -> {
                parkingService.setExitGateOpened(payload.equals("1"));
            }

            case "backend/parking/request/spots/count" -> {
                int freeParkingSpotsCount = parkingStatusController.getLatest().getFreeSpots();
                mqttClientManager.publishMessage("cps/parking/spots/count", String.valueOf(freeParkingSpotsCount));
            }
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // nothing to do
    }
}
