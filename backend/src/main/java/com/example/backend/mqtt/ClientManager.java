package com.example.backend.mqtt;

import java.nio.charset.StandardCharsets;

import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import com.example.backend.controller.CardController;

import jakarta.annotation.PostConstruct;

@Component
public class ClientManager {
    private static final Logger logger = LoggerFactory.getLogger(ClientManager.class);
    private static final int MAX_RETRIES = 5;
    private static final long RETRY_DELAY_MS = 5000;
    private static final String DEFAULT_BROKER = "tcp://gruppe1iot.local:1883";

    private final String brokerUrl;
    private final String username;
    private final String password;
    private final String clientId;
    private IMqttClient mqttClient;
    private final CardController cardController;

    public ClientManager(
        @Value("${MQTT_BROKER_URL:#{null}}") String mqttBrokerUrl,
        @Value("${MQTT_USERNAME:gruppe1}") String mqttUsername,
        @Value("${MQTT_PASSWORD:gruppe1}") String mqttPassword,
        CardController cardController
    ) {
        this.brokerUrl = mqttBrokerUrl != null ? mqttBrokerUrl : DEFAULT_BROKER;
        this.username = mqttUsername;
        this.password = mqttPassword;
        this.clientId = "backend_" + System.currentTimeMillis();
        this.cardController = cardController;
        logger.info("Using MQTT broker at: {}", this.brokerUrl);
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
                mqttClient = new MqttClient(brokerUrl, clientId);
            }
            if (!mqttClient.isConnected()) {
                System.out.println("Connecting to MQTT broker...");
                MqttConnectOptions options = new MqttConnectOptions();
                options.setUserName(username);
                options.setPassword(password.toCharArray());
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
