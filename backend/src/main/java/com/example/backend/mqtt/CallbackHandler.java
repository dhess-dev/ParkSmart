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

import com.example.backend.Parking;
import com.example.backend.controller.GateAccessController;
import com.example.backend.controller.ParkingSpotController;

@Component
public class CallbackHandler implements MqttCallback {

    private static final Logger logger = LoggerFactory.getLogger(CallbackHandler.class);

    private final GateAccessController gateAccessController;
    private final ParkingSpotController parkingSpotController;
    private final Parking parking;

    private ClientManager mqttClientManager;

    public CallbackHandler(GateAccessController gateAccessController, ParkingSpotController parkingSpotController, Parking parking) {
        this.gateAccessController = gateAccessController;
        this.parkingSpotController = parkingSpotController;
        this.parking = parking;
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


        if (topic.equals("backend/parking/gate/validation/rfid")) {
            String cardCode = new String(message.getPayload(), StandardCharsets.UTF_8);
            if (gateAccessController.getGateAccessByRfidCode(cardCode) != null) {
                parking.setEntryGateOpened(true);
                parking.setIdentificationCode(cardCode);
                mqttClientManager.publishMessage("cps/parking/gate/entry/open", "1");
            }
        }

        if (topic.equals("backend/parking/gate/validation/qrCode")) {
            String qrCode = new String(message.getPayload(), StandardCharsets.UTF_8);
            if (gateAccessController.getGateAccessByQrCode(qrCode) != null && !parking.isEntryGateOpened()) {
                parking.setEntryGateOpened(true);
                parking.setIdentificationCode(qrCode);
                mqttClientManager.publishMessage("cps/parking/gate/entry/open", "1");
            }

            case "backend/parking/spot/A1/distance" -> {
                String payload = new String(message.getPayload());
                float distance = Float.parseFloat(payload);
                if ((distance <= 5) != parking.isSpotOccupied()) {
                    parking.setSpotOccupied(distance <= 5);
                    parkingSpotController.updateSpot("A1");
                    mqttClientManager.publishMessage("cps/parking/spot/A1/isOccupied", parking.isSpotOccupied() ? "1" : "0");
                }
            }

            case "backend/parking/gate/distance" -> {
                String payload = new String(message.getPayload());
                float distance = Float.parseFloat(payload);

                if ((distance <= 5) && parking.isEntryGateOpened()) {
                    String eventType = "entry";
                    mqttClientManager.publishMessage("cps/parking/gate/entry/open", "0");
                    parking.setEntryGateOpened(false);
                    parking.logParkingEvent(eventType);
                    parking.createParkingStatusEntry(eventType);
                    parking.updateParkingCount();
                }

                boolean isCarInRange = distance > 5 && distance <= 10;
                if (isCarInRange && !parking.isExitGateOpened()) {
                    String eventType = "exit";
                    mqttClientManager.publishMessage("cps/parking/gate/exit/open", "1");
                    parking.setExitGateOpened(true);
                    parking.logParkingEvent(eventType);
                    parking.createParkingStatusEntry(eventType);
                }
            }

            case "backend/parking/gate/exit/open" -> {
                String payload = new String(message.getPayload());
                parking.setExitGateOpened(payload.equals("1"));
            }
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // nothing to do
    }
}
