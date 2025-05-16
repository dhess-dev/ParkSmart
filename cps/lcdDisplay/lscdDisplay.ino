#include <Arduino.h>
#include <WiFi.h>
#include <AsyncMQTT_ESP32.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// WiFi configuration
const char *ssid = "FES-SuS";
const char *password = "SuS-WLAN!Key24";
// MQTT configuration
const char *mqtt_server = "gruppe1iot.local";
const int mqtt_port = 1883;
const char *mqtt_user = "gruppe1";
const char *mqtt_password = "gruppe1";

// MQTT Client and timer handles
AsyncMqttClient mqttClientCam;
TimerHandle_t mqttReconnectTimer;
TimerHandle_t wifiReconnectTimer;

LiquidCrystal_I2C lcd(0x27, 16, 2);
String freeParkingSpotsCount = "10";

// Connect to WiFi
void connectToWifi() {
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);
}

// Connect to MQTT broker
void connectToMqtt() {
  Serial.println("Connecting to MQTT...");
  mqttClientCam.connect();
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
  mqttClientCam.subscribe("cps/#", 2);
}

// MQTT disconnect callback
void onMqttDisconnect(AsyncMqttClientDisconnectReason reason) {
  Serial.println("Disconnected from MQTT");
  if (WiFi.isConnected()) {
    // Start MQTT reconnect timer if WiFi is still connected
    xTimerStart(mqttReconnectTimer, 0);
  }
}

void onMqttMessage(char *topic, char *payload, AsyncMqttClientMessageProperties properties, size_t len, size_t index, size_t total) {
  if (strcmp(topic, "cps/parking/spots/count") == 0) {
    freeParkingSpotsCount = "";
    for (size_t i = 0; i < len; i++) {
      freeParkingSpotsCount += (char)payload[i];
    }
  }
}

void setup() {
  Serial.begin(115200);
  lcd.init();           // Initialize the LCD
  lcd.backlight();      // Turn on the LCD backlight
  lcd.setCursor(0, 0);  // Set the cursor to the first column of the first row
  lcd.print("Free Spots:");

  // Setup timers for MQTT, WiFi
  mqttReconnectTimer = xTimerCreate("mqttTimer", pdMS_TO_TICKS(2000), pdFALSE, (void *)0, reinterpret_cast<TimerCallbackFunction_t>(connectToMqtt));
  wifiReconnectTimer = xTimerCreate("wifiTimer", pdMS_TO_TICKS(2000), pdFALSE, (void *)0, reinterpret_cast<TimerCallbackFunction_t>(connectToWifi));

  // Setup WiFi event handler
  WiFi.onEvent(WiFiEvent);

  // Setup MQTT client
  mqttClientCam.onConnect(onMqttConnect);
  mqttClientCam.onDisconnect(onMqttDisconnect);
  mqttClientCam.onMessage(onMqttMessage);
  mqttClientCam.setServer(mqtt_server, mqtt_port);
  mqttClientCam.setCredentials(mqtt_user, mqtt_password);
  mqttClientCam.setClientId("ESP32ClientLCD");

  // Connect to WiFi
  connectToWifi();
}

void loop() {
  lcd.setCursor(0, 1);
  lcd.print("Count:");
  lcd.print(freeParkingSpotsCount);
  delay(1000);
  lcd.clear();
}