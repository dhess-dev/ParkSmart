#include <WiFi.h>
#include <AsyncMQTT_ESP32.h>
#include <MFRC522v2.h>
#include <MFRC522DriverSPI.h>
#include <MFRC522DriverPinSimple.h>
#include <ESP32Servo.h>

// WiFi configuration
// WiFi configuration
const char *ssid = "FES-SuS";
const char *password = "SuS-WLAN!Key24";

// MQTT configuration
const char *mqtt_server = "gruppe1iot-dev.local";
const int mqtt_port = 1883;
const char *mqtt_user = "gruppe1";
const char *mqtt_password = "gruppe1";

// LED setup
const int ledA1Red = 22;
const int ledA1Green = 23;

const int ledA2Red = 19;
const int ledA2Green = 21;

const int ledA3Red = 5;
const int ledA3Green = 18;

const int ledA4Red = 16;
const int ledA4Green = 17;

#define SOUND_SPEED 0.034

boolean isParkingSpotOccupied;

// MQTT Client and timer handles
AsyncMqttClient mqttClient;
TimerHandle_t mqttReconnectTimer;
TimerHandle_t wifiReconnectTimer;
TimerHandle_t closeExitGateTimer;

// Connect to WiFi
void connectToWifi() {
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);
  delay(10000);
}

// Connect to MQTT broker
void connectToMqtt() {
  Serial.println("Connecting to MQTT...");
  mqttClient.connect();
}

// WiFi event handler
void WiFiEvent(WiFiEvent_t event) {
  switch (event) {
    case ARDUINO_EVENT_WIFI_STA_GOT_IP:
      Serial.println("WiFi connected");
      Serial.println("IP address: ");
      Serial.println(WiFi.localIP());
      // Connect to MQTT after WiFi connection
      connectToMqtt();
      break;
    case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
      Serial.println("WiFi lost connection");
      // Stop MQTT reconnect timer if WiFi is disconnected
      xTimerStop(mqttReconnectTimer, 0);
      // Start WiFi reconnect timer
      xTimerStart(wifiReconnectTimer, 0);
      break;
    default:
      break;
  }
}

// MQTT connection callback
void onMqttConnect(bool sessionPresent) {
  Serial.println("Connected to MQTT");
  // Subscribe to the "LED" topic
  mqttClient.subscribe("cps/parking/spot/#", 2);
}

// MQTT disconnect callback
void onMqttDisconnect(AsyncMqttClientDisconnectReason reason) {
  Serial.println("Disconnected from MQTT");
  if (WiFi.isConnected()) {
    // Start MQTT reconnect timer if WiFi is still connected
    xTimerStart(mqttReconnectTimer, 0);
  }
}

// MQTT message callback
void onMqttMessage(char *topic, char *payload, AsyncMqttClientMessageProperties properties, size_t len, size_t index, size_t total) {

  // Print received MQTT message
  Serial.print("Message received on Topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  for (int i = 0; i < len; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  if (strcmp(topic, "cps/parking/spot/A1/isOccupied") == 0) {
    updateSpotLEDs(payload[0], ledA1Red, ledA1Green);
  }
   if (strcmp(topic, "cps/parking/spot/A2/isOccupied") == 0) {
    updateSpotLEDs(payload[0], ledA2Red, ledA2Green);
  }
   if (strcmp(topic, "cps/parking/spot/A3/isOccupied") == 0) {
    updateSpotLEDs(payload[0], ledA3Red, ledA3Green);
  }
   if (strcmp(topic, "cps/parking/spot/A4/isOccupied") == 0) {
    updateSpotLEDs(payload[0], ledA4Red, ledA4Green);
  }
}

void updateSpotLEDs(char payload, int redPin, int greenPin) {
  if (payload == '1') {
    digitalWrite(redPin, HIGH);
    digitalWrite(greenPin, LOW);
  } else {
    digitalWrite(redPin, LOW);
    digitalWrite(greenPin, HIGH);
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

    // Setup LED
  pinMode(ledA1Red, OUTPUT);
  pinMode(ledA1Green, OUTPUT);
  digitalWrite(ledA1Red, LOW);
  digitalWrite(ledA1Green, HIGH);

  pinMode(ledA2Red, OUTPUT);
  pinMode(ledA2Green, OUTPUT);
  digitalWrite(ledA2Red, LOW);
  digitalWrite(ledA2Green, HIGH);

  pinMode(ledA3Red, OUTPUT);
  pinMode(ledA3Green, OUTPUT);
  digitalWrite(ledA3Red, LOW);
  digitalWrite(ledA3Green, HIGH);

  pinMode(ledA4Red, OUTPUT);
  pinMode(ledA4Green, OUTPUT);
  digitalWrite(ledA4Red, LOW);
  digitalWrite(ledA4Green, HIGH);

  // Setup timers for MQTT, WiFi, and gate close
  mqttReconnectTimer = xTimerCreate("mqttTimer", pdMS_TO_TICKS(2000), pdFALSE, (void *)0, reinterpret_cast<TimerCallbackFunction_t>(connectToMqtt));
  wifiReconnectTimer = xTimerCreate("wifiTimer", pdMS_TO_TICKS(2000), pdFALSE, (void *)0, reinterpret_cast<TimerCallbackFunction_t>(connectToWifi));

  // Setup WiFi event handler
  WiFi.onEvent(WiFiEvent);

  // Setup MQTT client
  mqttClient.onConnect(onMqttConnect);
  mqttClient.onDisconnect(onMqttDisconnect);
  mqttClient.onMessage(onMqttMessage);
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCredentials(mqtt_user, mqtt_password);
  mqttClient.setClientId("ESP32LEDParking");

  // Connect to WiFi
  connectToWifi();
}

void loop() {

delay(500);

}