package com.example.backend.mqtt;

import java.nio.charset.StandardCharsets;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.backend.controller.GateAccessController;

public class CallbackHandler implements MqttCallback {

    private final GateAccessController gateAccessController;
    private static final Logger logger = LoggerFactory.getLogger(ClientManager.class);

    private final ClientManager mqttClientManager;
    private boolean isSpotOccupied;

    public CallbackHandler(ClientManager mqttClientManager, GateAccessController gateAccessController) {
        this.mqttClientManager = mqttClientManager;
        this.gateAccessController = gateAccessController;
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

        if (topic.equals("backend/parking/spot/distance")) {
            String payload = new String(message.getPayload());
            float distance = Float.parseFloat(payload);
            if ((distance <= 5) != isSpotOccupied) {
                isSpotOccupied = (distance <= 5);
                mqttClientManager.publishMessage("cps/parking/spot/isOccupied", isSpotOccupied ? "1" : "0");
            }
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // nothing to do
    }
}
