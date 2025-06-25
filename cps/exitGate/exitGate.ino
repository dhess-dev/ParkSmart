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

// Servo motor setup
Servo servoExitGate;
const int servoExitPin = 15;

// Ultra sonic setup
#define SOUND_SPEED 0.034
const int trigPinCloseExitGate = 5;
const int echoPinCloseExitGate = 7;
long durationCloseGate;
float distanceCloseGate;

const int trigPinOpenExitGate = 16;
const int echoPinOpenExitGate = 17;
long durationOpenGate;
float distanceOpenGate;


// MQTT Client and timer handles
AsyncMqttClient mqttClient;
TimerHandle_t mqttReconnectTimer;
TimerHandle_t wifiReconnectTimer;

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
  if (strcmp(topic, "cps/parking/gate/exit/open") == 0) {
    if (payload[0] == '1') {
      Serial.println("Opening exit gate...");
      servoExitGate.write(90);
    } else {
	  Serial.println("Closing exit gate...");
      servoExitGate.write(0);
	}
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

void setup() {
  Serial.begin(115200);

  // Setup Servo motor
  servoExitGate.attach(servoExitPin);
  // Setup ultra sonic
  pinMode(trigPinCloseExitGate, OUTPUT);
  pinMode(echoPinCloseExitGate, INPUT);
  pinMode(trigPinOpenExitGate, OUTPUT);
  pinMode(echoPinOpenExitGate, INPUT);

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
  mqttClient.setClientId("ExitGateClient");

  // Connect to WiFi
  connectToWifi();
}

void loop() {
  // Ultra Sonic Sensor close Gate
  digitalWrite(trigPinCloseExitGate, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPinCloseExitGate, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPinCloseExitGate, LOW);
  durationCloseGate = pulseIn(echoPinCloseExitGate, HIGH);
  distanceCloseGate = durationCloseGate * SOUND_SPEED / 2;

  Serial.print("distanceCloseGate (cm): ");
  Serial.println(distanceCloseGate);
  String payloadCloseGate = String(distanceCloseGate, 2);
  if (mqttClient.connected()) {
    mqttClient.publish("backend/parking/distance/close/exitGate", 0, false, payloadCloseGate.c_str());
  }
  delay(50);

  // Ultra Sonic Sensor open Gate
  digitalWrite(trigPinOpenExitGate, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPinOpenExitGate, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPinOpenExitGate, LOW);
  durationOpenGate = pulseIn(echoPinOpenExitGate, HIGH);
  distanceOpenGate = durationOpenGate * SOUND_SPEED / 2;

  Serial.print("distanceOpenGate (cm): ");
  Serial.println(distanceOpenGate);
  String payloadOpenGate = String(distanceOpenGate, 2);
  if (mqttClient.connected()) {
    mqttClient.publish("backend/parking/distance/open/exitGate", 0, false, payloadOpenGate.c_str());
  }
  delay(50);

  // Small delay to avoid overloading the loop
  delay(1000);
}