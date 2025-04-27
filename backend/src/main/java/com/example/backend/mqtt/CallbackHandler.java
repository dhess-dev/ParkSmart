package com.example.backend.mqtt;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttMessage;

public class CallbackHandler implements MqttCallback {

    private final ClientManager mqttClientManager;

    public CallbackHandler(ClientManager mqttClientManager) {
        this.mqttClientManager = mqttClientManager;
    }

    @Override
    public void connectionLost(Throwable cause) {
        System.out.println("Connection to MQTT broker lost: " + cause.getMessage());
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        mqttClientManager.handleReceivedMessage(topic, message);
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // nothing to do
    }
}