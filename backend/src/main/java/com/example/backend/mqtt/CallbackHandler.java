package com.example.backend.mqtt;

import java.nio.charset.StandardCharsets;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.example.backend.controller.BookingController;
import com.example.backend.controller.GateAccessController;
import com.example.backend.controller.ParkingStatusController;
import com.example.backend.services.ParkingService;

@Component
public class CallbackHandler implements MqttCallback {

    private static final Logger logger = LoggerFactory.getLogger(CallbackHandler.class);

    private final GateAccessController gateAccessController;
    private final BookingController bookingController;
    private final ParkingService parkingService;
    private final ParkingStatusController parkingStatusController;

    private ClientManager mqttClientManager;

    public CallbackHandler(GateAccessController gateAccessController, ParkingService parkingService, BookingController bookingController, ParkingStatusController parkingStatusController) {
        this.gateAccessController = gateAccessController;
        this.parkingService = parkingService;
        this.bookingController = bookingController;
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

        switch (topic) {
            case "backend/parking/gate/validation/rfid" -> {
                String cardCode = new String(message.getPayload(), StandardCharsets.UTF_8);
                if (gateAccessController.getGateAccessByRfidCode(cardCode) != null) {
                    if (!parkingService.isEntryGateOpened()) {
                        if (parkingStatusController.getLatest().getFreeSpots() > 0) {
                            parkingService.setIdentificationCode(cardCode);
                            parkingService.setEntryGateOpened(true);
                            mqttClientManager.publishMessage("cps/parking/gate/entry/open", "1");
                        } else mqttClientManager.publishMessage("cps/parking/full", "1");
                    }
                } else mqttClientManager.publishMessage("backend/parking/gate/validation/rfid/error", "1");
            }

            case "backend/parking/gate/validation/qrCode" -> {
                String qrCode = new String(message.getPayload(), StandardCharsets.UTF_8);
                if (bookingController.getBookingByQrCode(qrCode) != null) {
                    if (!parkingService.isEntryGateOpened()) {
                        if (parkingStatusController.getLatest().getFreeSpots() > 0) {
                            parkingService.setEntryGateOpened(true);
                            parkingService.setIdentificationCode(qrCode);
                            mqttClientManager.publishMessage("cps/parking/gate/entry/open", "1");
                        } else mqttClientManager.publishMessage("cps/parking/full", "1");
                    }
                } else mqttClientManager.publishMessage("backend/parking/gate/validation/qrCode/error", "1");
            }

            case "backend/parking/distance/spot/A1" -> {
                parkingService.handleSpotDistanceUpdate("A1", message);
            }

            case "backend/parking/distance/spot/A2" -> {
                parkingService.handleSpotDistanceUpdate("A2", message);
            }

            case "backend/parking/distance/gate" -> {
                String payload = new String(message.getPayload());
                float distance = Float.parseFloat(payload);           
                if ((distance <= 5) && parkingService.isEntryGateOpened()) {
                    String eventType = "entry";
                    mqttClientManager.publishMessage("cps/parking/gate/entry/open", "0");
                    parkingService.setEntryGateOpened(false);
                    parkingService.createParkingStatusEntry(eventType);
                    parkingService.updateParkingCount();
                }

                boolean isCarInRange = distance > 5 && distance <= 10;
                if (isCarInRange && !parkingService.isExitGateOpened()) {
                    String eventType = "exit";
                    mqttClientManager.publishMessage("cps/parking/gate/exit/open", "1");
                    parkingService.setExitGateOpened(true);
                    parkingService.createParkingStatusEntry(eventType);
                }
            }

            case "backend/parking/gate/exit/open" -> {
                String payload = new String(message.getPayload());
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
