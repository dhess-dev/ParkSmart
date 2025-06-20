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
AsyncMqttClient mqttClient;
TimerHandle_t mqttReconnectTimer;
TimerHandle_t wifiReconnectTimer;

LiquidCrystal_I2C lcd(0x27, 16, 2);

String freeParkingSpotsCount = "No Data";
unsigned long lastWarningTime = 0;
unsigned long lastRFIDErrorTime = 0;
unsigned long lastQrCodeErrorTime = 0;
unsigned long lastRequestTime = 0;
const unsigned long REQUEST_INTERVAL = 30000;
bool showFullWarning = false;
bool showRFIDWarning = false;
bool showQrCodeWarning = false;
bool displayNeedsUpdate = true;
bool mqttConnected = false;

// Connect to WiFi
void connectToWifi() {
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);
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
      Serial.print("IP address: ");
      Serial.println(WiFi.localIP());
      connectToMqtt();
      break;
    case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
      Serial.println("WiFi lost connection");
      mqttConnected = false;
      xTimerStop(mqttReconnectTimer, 0);
      xTimerStart(wifiReconnectTimer, 0);
      break;
    default:
      break;
  }
}

// MQTT connection callback
void onMqttConnect(bool sessionPresent) {
  Serial.println("Connected to MQTT");
  mqttConnected = true;
  
  // Subscribe to topics
  mqttClient.subscribe("cps/parking/spots/count", 2);
  mqttClient.subscribe("cps/parking/full", 2);
  mqttClient.subscribe("backend/parking/gate/validation/rfid/error", 2);
  mqttClient.subscribe("backend/parking/gate/validation/qrCode/error", 2);
  mqttClient.subscribe("cps/parking/gate/entry/open", 2);
  requestParkingData();
}

// MQTT disconnect callback
void onMqttDisconnect(AsyncMqttClientDisconnectReason reason) {
  Serial.println("Disconnected from MQTT");
  mqttConnected = false;
  if (WiFi.isConnected()) {
    xTimerStart(mqttReconnectTimer, 0);
  }
}

// MQTT message handler
void onMqttMessage(char *topic, char *payload, AsyncMqttClientMessageProperties properties, size_t len, size_t index, size_t total) {
  Serial.print("Message received on topic: ");
  Serial.println(topic);
  
  if (strcmp(topic, "cps/parking/spots/count") == 0) {
    freeParkingSpotsCount = "";
    for (size_t i = 0; i < len; i++) {
      freeParkingSpotsCount += (char)payload[i];
    }
    Serial.print("Free parking spots: ");
    Serial.println(freeParkingSpotsCount);
    
    if (!showFullWarning && !showRFIDWarning && !showQrCodeWarning) {
      displayNeedsUpdate = true;
    }
  }

  if (strcmp(topic, "cps/parking/gate/entry/open") == 0) {
    if (payload[0] == '1') {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Herzlich");
      lcd.setCursor(0, 1);
      lcd.print("Willkommen!");
    } else {  
      updateNormalDisplay();
    }
  }
  
  if (strcmp(topic, "cps/parking/full") == 0) {
    Serial.println("Parking full warning received");
    showFullWarning = true;
    showRFIDWarning = false;  
    showQrCodeWarning = false;
    lastWarningTime = millis();
    displayNeedsUpdate = true;
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Achtung: Kein");
    lcd.setCursor(0, 1);
    lcd.print("Parkplatz frei");
  }

  if (strcmp(topic, "backend/parking/gate/validation/rfid/error") == 0) {
    Serial.println("RFID validation error received");
    showRFIDWarning = true;
    showFullWarning = false;  
    showQrCodeWarning = false;
    lastRFIDErrorTime = millis();
    displayNeedsUpdate = true;
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Karte ung");
    lcd.write(0xF5);
    lcd.print("ltig");

    lcd.setCursor(0, 1);
    lcd.print("Kein Zugang!");
  }

  if (strcmp(topic, "backend/parking/gate/validation/qrCode/error") == 0) {
    Serial.println("QR-Code validation error received");
    showQrCodeWarning = true;
    showFullWarning = false;  
    showRFIDWarning = false;
    lastQrCodeErrorTime = millis();
    displayNeedsUpdate = true;
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("QR ung");
    lcd.write(0xF5);
    lcd.print("ltig");
    lcd.setCursor(0, 1);
    lcd.print("Kein Zugang!");
  }
}

void requestParkingData() {
  if (mqttConnected) {
    Serial.println("Requesting parking data...");
    mqttClient.publish("backend/parking/request/spots/count", 0, false, "1");
    lastRequestTime = millis();
  }
}

void updateNormalDisplay() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Freie Park-");
  lcd.setCursor(0, 1);
  lcd.print("pl");
  lcd.write(0xE1);
  lcd.print("tze: ");
  lcd.print(freeParkingSpotsCount);
  displayNeedsUpdate = false;
}

void setup() {
  Serial.begin(115200);
  
  lcd.init();
  lcd.backlight();
  lcd.clear();
  
  updateNormalDisplay();
  
  mqttReconnectTimer = xTimerCreate("mqttTimer", pdMS_TO_TICKS(2000), pdFALSE, (void *)0, reinterpret_cast<TimerCallbackFunction_t>(connectToMqtt));
  wifiReconnectTimer = xTimerCreate("wifiTimer", pdMS_TO_TICKS(2000), pdFALSE, (void *)0, reinterpret_cast<TimerCallbackFunction_t>(connectToWifi));
  
  WiFi.onEvent(WiFiEvent);
  mqttClient.onConnect(onMqttConnect);
  mqttClient.onDisconnect(onMqttDisconnect);
  mqttClient.onMessage(onMqttMessage);
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCredentials(mqtt_user, mqtt_password);
  mqttClient.setClientId("ESP32ClientLCD");
  
  connectToWifi();
}

void loop() {
  if (showFullWarning && (millis() - lastWarningTime >= 10000)) {
    showFullWarning = false;
    displayNeedsUpdate = true;
  }

  if (showRFIDWarning && (millis() - lastRFIDErrorTime >= 10000)) {
    showRFIDWarning = false;
    displayNeedsUpdate = true;
  }

  if (showQrCodeWarning && (millis() - lastQrCodeErrorTime >= 10000)) {
    showQrCodeWarning = false;
    displayNeedsUpdate = true;
  }
  
  if (!showFullWarning && !showRFIDWarning && !showQrCodeWarning && displayNeedsUpdate) {
    updateNormalDisplay();
  }
  
  delay(100);
}