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

import com.example.backend.controller.GateAccessController;
import com.example.backend.models.ParkingSpot;
import com.example.backend.repositories.ParkingSpotRepository;

@Component
public class CallbackHandler implements MqttCallback {

    private static final Logger logger = LoggerFactory.getLogger(CallbackHandler.class);

    private final GateAccessController gateAccessController;
    private final ParkingSpotRepository parkingSpotRepository;

    private ClientManager mqttClientManager;

    private boolean isSpotOccupied;

    public CallbackHandler(GateAccessController gateAccessController, ParkingSpotRepository parkingSpotRepository) {
        this.gateAccessController = gateAccessController;
        this.parkingSpotRepository = parkingSpotRepository;
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
            if (gateAccessController.getCardByRfidCode(cardCode) != null) {
                mqttClientManager.publishMessage("cps/parking/gate/open", "1");
            }
        }

        if (topic.equals("backend/parking/spot/A1/distance")) {
            String payload = new String(message.getPayload());
            float distance = Float.parseFloat(payload);
            if ((distance <= 5) != isSpotOccupied) {
                isSpotOccupied = (distance <= 5);
                ParkingSpot parkingSpot = parkingSpotRepository.findByPosition("A1").orElse(null);
                if (parkingSpot == null) {
                    parkingSpot = new ParkingSpot();
                    parkingSpot.setPosition("A1");
                }
                parkingSpot.setIsOccupied(isSpotOccupied);
                parkingSpotRepository.save(parkingSpot);
                mqttClientManager.publishMessage("cps/parking/spot/A1/isOccupied", isSpotOccupied ? "1" : "0");
            }
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // nothing to do
    }
}
