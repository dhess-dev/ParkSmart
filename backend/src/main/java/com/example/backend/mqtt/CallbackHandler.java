package com.example.backend.mqtt;

import java.nio.charset.StandardCharsets;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttMessage;

import com.example.backend.controller.CardController;

public class CallbackHandler implements MqttCallback {

    private final CardController cardController;
    private final ClientManager mqttClientManager;

    public CallbackHandler(ClientManager mqttClientManager, CardController cardController) {
        this.mqttClientManager = mqttClientManager;
        this.cardController = cardController;
    }

    @Override
    public void connectionLost(Throwable cause) {
        System.out.println("Connection to MQTT broker lost: " + cause.getMessage());
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        mqttClientManager.handleReceivedMessage(topic, message);

        if (!"parking/gate/validation/rfid".equals(topic)) {
            return;
        }

        String cardCode = new String(message.getPayload(), StandardCharsets.UTF_8);
        if (cardController.getCardByCardCode(cardCode) != null) {
            mqttClientManager.publishMessage("parking/gate/open", "1");
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // nothing to do
    }
}
