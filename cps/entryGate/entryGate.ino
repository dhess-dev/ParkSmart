#include <WiFi.h>
#include <AsyncMQTT_ESP32.h>
#include <MFRC522v2.h>
#include <MFRC522DriverSPI.h>
#include <MFRC522DriverPinSimple.h>
#include <ESP32Servo.h>
#include <LiquidCrystal_I2C.h>

// WiFi configuration
const char *ssid = "BerufsschuleProjekte";
const char *password = "berufsschule";

// MQTT configuration
const char *mqtt_server = "gruppe1iot-dev.local";
const int mqtt_port = 1883;
const char *mqtt_user = "gruppe1";
const char *mqtt_password = "gruppe1";

// RFID setup
MFRC522DriverPinSimple ss_pin(10);
MFRC522DriverSPI driver{ ss_pin };
MFRC522 mfrc522{ driver };

// Servo motor setup
Servo servoEntryGate;
const int servoEntryPin = 18;

// Ultra sonic setup
const int trigPinGate = 4;
const int echoPinGate = 6;
#define SOUND_SPEED 0.034
long durationGate;
float distanceGate;

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
unsigned long lastRFIDCheck = 0;
unsigned long lastUltrasonicCheck = 0;
unsigned long lastQrCodeExpiredTime = 0;
unsigned long lastAccessDeniedTime = 0;  
unsigned long lastMQTTPublish = 0;
const unsigned long REQUEST_INTERVAL = 30000;
const unsigned long RFID_CHECK_INTERVAL = 200;     
const unsigned long ULTRASONIC_INTERVAL = 500;     
const unsigned long MQTT_PUBLISH_INTERVAL = 1000;  
bool showFullWarning = false;
bool showRFIDWarning = false;
bool showQrCodeWarning = false;
bool showQrCodeExpiredWarning = false;
bool showAccessDeniedWarning = false; 
bool displayNeedsUpdate = true;
bool mqttConnected = false;

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
      mqttConnected = false;
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
  mqttConnected = true;
  // Subscribe 
  mqttClient.subscribe("cps/parking/gate/entry#", 2);

  // Subscribe to topics
  mqttClient.subscribe("cps/parking/spots/count", 2);
  mqttClient.subscribe("cps/parking/full", 2);
  mqttClient.subscribe("cps/parking/gate/validation/rfid/error", 2);
  mqttClient.subscribe("cps/parking/gate/validation/qrCode/error", 2);
  mqttClient.subscribe("cps/parking/gate/validation/qrCode/expired", 2);
  mqttClient.subscribe("cps/parking/gate/entry/open", 2);
  
  requestParkingData();
}

// MQTT disconnect callback
void onMqttDisconnect(AsyncMqttClientDisconnectReason reason) {
  Serial.println("Disconnected from MQTT");
  mqttConnected = false;
  if (WiFi.isConnected()) {
    // Start MQTT reconnect timer if WiFi is still connected
    xTimerStart(mqttReconnectTimer, 0);
  }
}

// MQTT message callback
void onMqttMessage(char *topic, char *payload, AsyncMqttClientMessageProperties properties, size_t len, size_t index, size_t total) {
  Serial.print("Message received on topic: ");
  Serial.println(topic);
  
  if (strcmp(topic, "cps/parking/gate/entry/open") == 0) {
    if (payload[0] == '1') {
      Serial.println("Opening entry gate...");
      // Rotate servo to 90 degrees to open the entry gate
      servoEntryGate.write(90);
      
      showFullWarning = false;
      showRFIDWarning = false;
      showQrCodeWarning = false;
      showQrCodeExpiredWarning = false;
      showAccessDeniedWarning = false;
    } else {
      Serial.println("Closing entry gate...");
      // Rotate servo back to 0 degrees to close the entry gate
      servoEntryGate.write(0);
      
      displayNeedsUpdate = true;
    }
  }
  
  if (strcmp(topic, "cps/parking/spots/count") == 0) {
    freeParkingSpotsCount = "";
    for (size_t i = 0; i < len; i++) {
      freeParkingSpotsCount += (char)payload[i];
    }
    Serial.print("Free parking spots: ");
    Serial.println(freeParkingSpotsCount);
    
    if (!showFullWarning && !showRFIDWarning && !showQrCodeWarning && 
        !showQrCodeExpiredWarning && !showAccessDeniedWarning) {
      displayNeedsUpdate = true;
    }
  }
  
  if (strcmp(topic, "cps/parking/full") == 0) {
    Serial.println("Parking full warning received");
    showFullWarning = true;
    showRFIDWarning = false;  
    showQrCodeWarning = false;
    showQrCodeExpiredWarning = false;
    showAccessDeniedWarning = false;
    lastWarningTime = millis();
    displayNeedsUpdate = true;
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Achtung: Kein");
    lcd.setCursor(0, 1);
    lcd.print("Parkplatz frei");
  }

  if (strcmp(topic, "cps/parking/gate/validation/rfid/error") == 0) {
    Serial.println("RFID validation error received");
    showRFIDWarning = true;
    showFullWarning = false;  
    showQrCodeWarning = false;
    showQrCodeExpiredWarning = false;
    showAccessDeniedWarning = false;
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

  if (strcmp(topic, "cps/parking/gate/validation/qrCode/error") == 0) {
    Serial.println("QR-Code validation error received");
    showQrCodeWarning = true;
    showFullWarning = false;  
    showRFIDWarning = false;
    showQrCodeExpiredWarning = false;
    showAccessDeniedWarning = false;
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

  if (strcmp(topic, "cps/parking/gate/validation/qrCode/expired") == 0) {
    Serial.println("QR-Code is expired");
    showQrCodeExpiredWarning = true;
    showAccessDeniedWarning = false;  
    showQrCodeWarning = false;
    showFullWarning = false;  
    showRFIDWarning = false;
    lastQrCodeExpiredTime = millis();
    displayNeedsUpdate = true;
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("QR-Code");
    lcd.setCursor(0, 1);
    lcd.print("abgelaufen");
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
  if (displayNeedsUpdate) {
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
}

// Separate RFID check function with timing control
void checkRFID() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastRFIDCheck >= RFID_CHECK_INTERVAL) {
    lastRFIDCheck = currentTime;
    
    if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
      Serial.println("RFID card detected!");
      
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
      if (mqttConnected) {
        mqttClient.publish("backend/parking/gate/validation/rfid", 0, false, uidString.c_str());
      }

      // Deactivate the card
      mfrc522.PICC_HaltA();
      mfrc522.PCD_StopCrypto1();
      
      // Short delay after RFID processing
      delay(50);
    }
  }
}

// Separate ultrasonic sensor function
void checkUltrasonic() {
  unsigned long currentTime = millis();
  
  // Only check ultrasonic every ULTRASONIC_INTERVAL ms
  if (currentTime - lastUltrasonicCheck >= ULTRASONIC_INTERVAL) {
    lastUltrasonicCheck = currentTime;
    
    // Ultra Sonic Sensor Gate
    digitalWrite(trigPinGate, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPinGate, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPinGate, LOW);
    durationGate = pulseIn(echoPinGate, HIGH);
    distanceGate = durationGate * SOUND_SPEED / 2;
    
    // Only publish if MQTT is connected and enough time has passed
    if (mqttConnected && (currentTime - lastMQTTPublish >= MQTT_PUBLISH_INTERVAL)) {
      String payloadGate = String(distanceGate, 2);
      mqttClient.publish("backend/parking/distance/gate", 0, false, payloadGate.c_str());
      lastMQTTPublish = currentTime;
    }
  }
}

// Handle warning timeouts and display updates
void handleWarningsAndDisplay() {
  unsigned long currentTime = millis();
  
  // Handle QR-Code expired warning
  if (showQrCodeExpiredWarning && (currentTime - lastQrCodeExpiredTime >= 5000)) {
    showQrCodeExpiredWarning = false;
    // Aktiviere "Zugang verweigert" Warnung
    showAccessDeniedWarning = true;
    lastAccessDeniedTime = currentTime;
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Zugang");
    lcd.setCursor(0, 1);
    lcd.print("verweigert!");
  }
  
  // Handle Access Denied warning
  if (showAccessDeniedWarning && (currentTime - lastAccessDeniedTime >= 5000)) {
    showAccessDeniedWarning = false;
    displayNeedsUpdate = true;
  }
  
  // Handle warning timeouts
  if (showFullWarning && (currentTime - lastWarningTime >= 5000)) {
    showFullWarning = false;
    displayNeedsUpdate = true;
  }

  if (showRFIDWarning && (currentTime - lastRFIDErrorTime >= 5000)) {
    showRFIDWarning = false;
    displayNeedsUpdate = true;
  }

  if (showQrCodeWarning && (currentTime - lastQrCodeErrorTime >= 5000)) {
    showQrCodeWarning = false;
    displayNeedsUpdate = true;
  }
  
  // Update display only when needed and no warnings or welcome message are active
  if (!showFullWarning && !showRFIDWarning && !showQrCodeWarning && 
      !showQrCodeExpiredWarning && !showAccessDeniedWarning) {
    updateNormalDisplay();
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Setup RFID
  mfrc522.PCD_Init();
  Serial.println(F("RFID initialized. Scan PICC to see UID..."));
  

  // Setup Servo motor
  servoEntryGate.attach(servoEntryPin);
  
  // Setup ultra sonic
  pinMode(trigPinGate, OUTPUT);
  pinMode(echoPinGate, INPUT);

  // Setup LCD-Display
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("System starting...");
  delay(2000);

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
  mqttClient.setClientId("ESP32Client");

  // Connect to WiFi
  connectToWifi();
  
  lastRFIDCheck = millis();
  lastUltrasonicCheck = millis();
  lastMQTTPublish = millis();
}

void loop() {
  checkRFID();
  
  checkUltrasonic();
  
  handleWarningsAndDisplay();
  
  // Small delay to prevent overwhelming the system
  delay(10);
}