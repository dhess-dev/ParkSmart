package com.example.backend.mqtt;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.backend.controller.CardController;

import jakarta.annotation.PostConstruct;

@EnableAsync
@Component
@EnableScheduling
public class ClientManager {

    private static final Logger logger = LoggerFactory.getLogger(ClientManager.class);

    private final String brokerUrl;
    private final String username;
    private final String password;
    private final String clientId;
    private IMqttClient mqttClient;
    private final CardController cardController;

    public ClientManager(
            @Value("${MQTT_BROKER_URL:tcp://gruppe1iot.local:1883}") String mqttBrokerUrl,
            @Value("${MQTT_USERNAME:gruppe1}") String mqttUsername,
            @Value("${MQTT_PASSWORD:gruppe1}") String mqttPassword,
            CardController cardController
    ) {
        this.brokerUrl = mqttBrokerUrl;
        this.username = mqttUsername;
        this.password = mqttPassword;
        this.clientId = "client_" + UUID.randomUUID().toString();
        this.cardController = cardController;
        logger.info("Using MQTT broker at: {}", this.brokerUrl);
    }

    @PostConstruct
    public void subscribeAllTopics() {
        if (mqttClient == null || !mqttClient.isConnected()) {
            connectMqttClient();
        }
        if (mqttClient != null && mqttClient.isConnected()) {
            subscribeTopic("parking/backend/#");
        }
    }

    public IMqttClient connectMqttClient() {
        try {
            if (mqttClient == null) {
                mqttClient = new MqttClient(brokerUrl, clientId);
            }
            if (!mqttClient.isConnected()) {
                logger.info("Connecting to MQTT broker...");
                MqttConnectOptions options = new MqttConnectOptions();
                options.setUserName(username);
                options.setPassword(password.toCharArray());
                options.setCleanSession(true);
                mqttClient.connect(options);
                logger.info("Successfully connected to MQTT broker.");
            }
        } catch (MqttException e) {
            logger.error("Error while connecting to MQTT broker: {} (Error Code: {})", e.getMessage(), e.getReasonCode());
        }
        return mqttClient;
    }

    @Async
    @Scheduled(fixedDelay = 10000)
    public void reconnectMqtt() {
        if (!mqttClient.isConnected()) {
            connectMqttClient();
        }
    }

    public void publishMessage(String topic, String message) {
        try {
            if (mqttClient == null || !mqttClient.isConnected()) {
                connectMqttClient();
            }
            if (mqttClient != null && mqttClient.isConnected()) {
                mqttClient.publish(topic, message.getBytes(StandardCharsets.UTF_8), 2, false);
                logger.info("Message published to '{}': {}", topic, message);
            }
        } catch (MqttException e) {
            logger.error("Failed to publish message: {}", e.getMessage());
        }
    }

    public void subscribeTopic(String topic) {
        try {
            if (mqttClient != null && mqttClient.isConnected()) {
                mqttClient.setCallback(new CallbackHandler(this, cardController));
                mqttClient.subscribe(topic);
                logger.info("Subscribed to topic: {}", topic);
            }
        } catch (MqttException e) {
            logger.error("Failed to subscribe to topic '{}': {}", topic, e.getMessage());
        }
    }

    public void handleReceivedMessage(String topic, MqttMessage message) {
        String msgContent = new String(message.getPayload(), StandardCharsets.UTF_8);
        logger.info("Message received on topic '{}': {}", topic, msgContent);
    }
}
