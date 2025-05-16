#include <WiFi.h>
#include <AsyncMQTT_ESP32.h>
#include <MFRC522v2.h>
#include <MFRC522DriverSPI.h>
#include <MFRC522DriverPinSimple.h>
#include <ESP32Servo.h>

// WiFi configuration
const char *ssid = "FES-SuS";
const char *password = "SuS-WLAN!Key24";

// MQTT configuration
const char *mqtt_server = "gruppe1iot.local";
const int mqtt_port = 1883;
const char *mqtt_user = "gruppe1";
const char *mqtt_password = "gruppe1";

// RFID setup
MFRC522DriverPinSimple ss_pin(8);
MFRC522DriverSPI driver{ ss_pin };
MFRC522 mfrc522{ driver };

// Servo motor setup
Servo servoEntryGate;
const int servoEntryPin = 18;
Servo servoExitGate;
const int servoExitPin = 15;

// Ultra sonic setup
const int trigPinSpotA1 = 5;
const int echoPinSpotA1 = 7;
const int trigPinSpotA2 = 9;
const int echoPinSpotA2 = 10;
const int trigPinGate = 4;
const int echoPinGate = 6;
#define SOUND_SPEED 0.034
long durationA1;
long durationA2;
long durationGate;
float distanceA1;
float distanceA2;
float distanceGate;
boolean isParkingSpotOccupied;

// LED setup
const int ledA1Red = 16;
const int ledA1Green = 17;

const int ledA2Red = 1;
const int ledA2Green = 2;

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
  // Subscribe to the "open gate" topic
  mqttClient.subscribe("cps/#", 2);
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
  if (strcmp(topic, "cps/parking/gate/entry/open") == 0) {
    if (payload[0] == '1') {
      Serial.println("Opening entry gate...");
      // Rotate servo to 90 degrees to open the entry gate
      servoEntryGate.write(90);
    } else {
      Serial.println("Closing entry gate...");
      // Rotate servo back to 0 degrees to close the entry gate
      servoEntryGate.write(0);
    }
  }
  if (strcmp(topic, "cps/parking/gate/exit/open") == 0) {
    if (payload[0] == '1') {
      Serial.println("Opening exit gate...");
      // Rotate servo to 90 degrees to open the exit gate
      servoExitGate.write(90);
      xTimerStart(closeExitGateTimer, 0);
    }
  }
  if (strcmp(topic, "cps/parking/spot/A1/isOccupied") == 0) {
    updateSpotLEDs(payload[0], ledA1Red, ledA1Green);
  }
  if (strcmp(topic, "cps/parking/spot/A2/isOccupied") == 0) {
    updateSpotLEDs(payload[0], ledA2Red, ledA2Green);
  }

  // Print received MQTT message
  Serial.print("Message received on Topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  for (int i = 0; i < len; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void closeExitGate(TimerHandle_t xTimer) {
  Serial.println("Closing exit gate...");
  // Rotate servo back to 0 degrees to close the exit gate
  servoExitGate.write(0);
  String payload = "0";
  mqttClient.publish("backend/parking/gate/exit/open", 0, false, payload.c_str());
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

  // Setup RFID
  mfrc522.PCD_Init();
  Serial.println(F("Scan PICC to see UID..."));

  // Setup Servo motor
  servoEntryGate.attach(servoEntryPin);
  servoExitGate.attach(servoExitPin);
  // Setup ultra sonic
  pinMode(trigPinSpotA1, OUTPUT);
  pinMode(echoPinSpotA1, INPUT);
  pinMode(trigPinSpotA2, OUTPUT);
  pinMode(echoPinSpotA2, INPUT);
  pinMode(trigPinGate, OUTPUT);
  pinMode(echoPinGate, INPUT);

  // Setup LED
  pinMode(ledA1Red, OUTPUT);
  pinMode(ledA1Green, OUTPUT);
  digitalWrite(ledA1Red, LOW);
  digitalWrite(ledA1Green, HIGH);

  pinMode(ledA2Red, OUTPUT);
  pinMode(ledA2Green, OUTPUT);
  digitalWrite(ledA2Red, LOW);
  digitalWrite(ledA2Green, HIGH);

  // Setup timers for MQTT, WiFi, and gate close
  mqttReconnectTimer = xTimerCreate("mqttTimer", pdMS_TO_TICKS(2000), pdFALSE, (void *)0, reinterpret_cast<TimerCallbackFunction_t>(connectToMqtt));
  wifiReconnectTimer = xTimerCreate("wifiTimer", pdMS_TO_TICKS(2000), pdFALSE, (void *)0, reinterpret_cast<TimerCallbackFunction_t>(connectToWifi));
  closeExitGateTimer = xTimerCreate("gateTimer", pdMS_TO_TICKS(5000), pdFALSE, (void *)0, closeExitGate);

  // Setup WiFi event handler
  WiFi.onEvent(WiFiEvent);

  // Setup MQTT client
  mqttClient.onConnect(onMqttConnect);
  mqttClient.onDisconnect(onMqttDisconnect);
  mqttClient.onMessage(onMqttMessage);
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCredentials(mqtt_user, mqtt_password);
  mqttClient.setClientId("ESP32Client");

  // Connect to WiFi
  connectToWifi();
}

void loop() {
  // --- RFID: Detect card and send UID ---
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    // Convert UID to string
    String uidString = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      if (mfrc522.uid.uidByte[i] < 0x10) {
        uidString += "0";
      }
      uidString += String(mfrc522.uid.uidByte[i], HEX);
    }
    uidString.toUpperCase();
    Serial.println("UID: " + uidString);

    // Publish UID to MQTT for validation
    mqttClient.publish("backend/parking/gate/validation/rfid", 0, false, uidString.c_str());

    // Deactivate the card
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
  }

  // Ultra Sonic Sensor A1
  digitalWrite(trigPinSpotA1, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPinSpotA1, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPinSpotA1, LOW);
  durationA1 = pulseIn(echoPinSpotA1, HIGH);
  distanceA1 = durationA1 * SOUND_SPEED / 2;

  delay(50);

  // Ultra Sonic Sensor A2
  digitalWrite(trigPinSpotA2, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPinSpotA2, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPinSpotA2, LOW);
  durationA2 = pulseIn(echoPinSpotA2, HIGH);
  distanceA2 = durationA2 * SOUND_SPEED / 2;

  delay(50);

  // Ultra Sonic Sensor Gate
  digitalWrite(trigPinGate, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPinGate, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPinGate, LOW);
  durationGate = pulseIn(echoPinGate, HIGH);
  distanceGate = durationGate * SOUND_SPEED / 2;

  Serial.print("DistanceA1 (cm): ");
  Serial.println(distanceA1);
  Serial.print("DistanceGate (cm SECOND): ");
  Serial.println(distanceGate);

  Serial.print("DistanceA2 (cm): ");
  Serial.println(distanceA2);

  String payloadA1 = String(distanceA1, 2);
  String payloadGate = String(distanceGate, 2);
  mqttClient.publish("backend/parking/distance/spot/A1", 0, false, payloadA1.c_str());
  mqttClient.publish("backend/parking/distance/gate", 0, false, payloadGate.c_str());
  String payloadA2 = String(distanceA2, 2);
  mqttClient.publish("backend/parking/distance/spot/A2", 0, false, payloadA2.c_str());

  // Small delay to avoid overloading the loop
  delay(1000);
}