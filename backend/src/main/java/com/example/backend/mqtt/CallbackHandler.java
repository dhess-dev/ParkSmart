package com.example.backend.mqtt;

import java.nio.charset.StandardCharsets;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.backend.controller.CardController;

public class CallbackHandler implements MqttCallback {

    private static final Logger logger = LoggerFactory.getLogger(ClientManager.class);

    private final CardController cardController;
    private final ClientManager mqttClientManager;

    private boolean isSpotOccupied;

    public CallbackHandler(ClientManager mqttClientManager, CardController cardController) {
        this.mqttClientManager = mqttClientManager;
        this.cardController = cardController;
    }

    @Override
    public void connectionLost(Throwable cause) {
        logger.warn("Connection to MQTT broker lost: {}", cause.getMessage());
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        mqttClientManager.handleReceivedMessage(topic, message);

        if (topic.equals("parking/backend/gate/validation/rfid")) {
            String cardCode = new String(message.getPayload(), StandardCharsets.UTF_8);
            if (cardController.getCardByCardCode(cardCode) != null) {
                mqttClientManager.publishMessage("parking/cps/gate/open", "1");
            }
        }

        if (topic.equals("parking/backend/spot/distance")) {
            String payload = new String(message.getPayload());
            float distance = Float.parseFloat(payload);
            if ((distance <= 5) != isSpotOccupied) {
                isSpotOccupied = (distance <= 5);
                mqttClientManager.publishMessage("parking/cps/spot/isOccupied", isSpotOccupied ? "1" : "0");
            }
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // nothing to do
    }
}
