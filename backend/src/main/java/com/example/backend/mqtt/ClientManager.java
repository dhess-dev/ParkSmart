package com.example.backend.mqtt;

import java.nio.charset.StandardCharsets;

import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct;

@Component
@RestController
@RequestMapping("/api")
public class ClientManager {

    private final String BROKER_ADDRESS; 
    private final String MQTT_USER;
    private final String MQTT_PASSWORD;
    private final String MQTT_TOPIC;
    private final String CLIENT_ID;
    private static IMqttClient mqttClient;

    public ClientManager() {
        this.BROKER_ADDRESS = "tcp://192.168.2.189:1883";
        this.MQTT_USER = "gruppe1";
        this.MQTT_PASSWORD = "gruppe1";
        this.MQTT_TOPIC = "testTopic";
        this.CLIENT_ID = "testClient";   
    }

    @PostConstruct
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
                try {
                    mqttClient.connect(options);
                    System.out.println("Successfully connected to MQTT broker.");
                    subscribeTopic();  
                } catch (MqttException e) {
                    System.out.println("Connection error: " + e.getMessage());
                }
            }
        } catch (MqttException e) {
            System.out.println("Error while connecting to MQTT broker: " + e.getMessage() + " (Error Code: " + e.getReasonCode() + ")");
        }
    
        return mqttClient;
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @GetMapping("/mqtt")
    public void publishMessage() throws MqttException {
        String message = "Message from Backend";
            if (mqttClient == null || !mqttClient.isConnected()) {
                connectMqttClient();
            }
            mqttClient.publish(MQTT_TOPIC, message.getBytes(StandardCharsets.UTF_8), 2, false);
            System.out.println("Message published: " + message);
    }

    public void subscribeTopic() throws MqttException {
        if (mqttClient == null || !mqttClient.isConnected()) {
            connectMqttClient();
        }
        mqttClient.setCallback(new CallbackHandler(this));
        mqttClient.subscribe(MQTT_TOPIC);
        System.out.println("Subscribed to topic: " + MQTT_TOPIC);
    }

    public void handleReceivedMessage(String topic, MqttMessage message) {
        byte[] payload = message.getPayload();
        String msgContent = new String(payload, StandardCharsets.UTF_8);
        System.out.println("Message received on topic '" + topic + "': " + msgContent);
    }
}