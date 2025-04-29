package com.example.backend.mqtt;

import java.nio.charset.StandardCharsets;

import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Component;

import com.example.backend.controller.CardController;

import jakarta.annotation.PostConstruct;

@Component
public class ClientManager {

    private final String BROKER_ADDRESS;
    private final String MQTT_USER;
    private final String MQTT_PASSWORD;
    private final String CLIENT_ID;
    private static IMqttClient mqttClient;
    private final CardController cardController;

    public ClientManager(CardController cardController) {
        this.BROKER_ADDRESS = "tcp://gruppe1iot.local:1883";
        this.MQTT_USER = "gruppe1";
        this.MQTT_PASSWORD = "gruppe1";
        this.CLIENT_ID = "testClient";
        this.cardController = cardController;
    }

    @PostConstruct
    public void subscribeAllTopics() {
        if (mqttClient == null || !mqttClient.isConnected()) {
            connectMqttClient();
        }
        if (mqttClient != null && mqttClient.isConnected()) {
            subscribeTopic("parking/gate/validation/rfid");
        }
    }

    public IMqttClient connectMqttClient() {
        try {
            if (mqttClient == null) {
                mqttClient = new MqttClient(BROKER_ADDRESS, CLIENT_ID);
            }
            if (!mqttClient.isConnected()) {
                System.out.println("Connecting to MQTT broker...");
                MqttConnectOptions options = new MqttConnectOptions();
                options.setUserName(MQTT_USER);
                options.setPassword(MQTT_PASSWORD.toCharArray());
                options.setCleanSession(true);
                mqttClient.connect(options);
                System.out.println("Successfully connected to MQTT broker.");
            }
        } catch (MqttException e) {
            System.out.println("Error while connecting to MQTT broker: " + e.getMessage() + " (Error Code: " + e.getReasonCode() + ")");

        }
        return mqttClient;
    }

    public void publishMessage(String topic, String message) {
        try {
            if (mqttClient == null || !mqttClient.isConnected()) {
                connectMqttClient();
            }
            if (mqttClient != null && mqttClient.isConnected()) {
                mqttClient.publish(topic, message.getBytes(StandardCharsets.UTF_8), 2, false);
                System.out.println("Message published: " + message);
            }
        } catch (MqttException e) {
            System.out.println("Failed to publish message: " + e.getMessage());
        }
    }

    public void subscribeTopic(String topic) {
        try {
            if (mqttClient == null || !mqttClient.isConnected()) {
                connectMqttClient();
            }
            if (mqttClient != null && mqttClient.isConnected()) {
                mqttClient.setCallback(new CallbackHandler(this, cardController));
                mqttClient.subscribe(topic);
                System.out.println("Subscribed to topic: " + topic);
            }
        } catch (MqttException e) {
            System.out.println("Failed to subscribe to topic '" + topic + "': " + e.getMessage());
        }
    }

    public void handleReceivedMessage(String topic, MqttMessage message) {
        byte[] payload = message.getPayload();
        String msgContent = new String(payload, StandardCharsets.UTF_8);
        System.out.println("Message received on topic '" + topic + "': " + msgContent);
    }
}
