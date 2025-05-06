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
MFRC522DriverSPI driver{ss_pin};
MFRC522 mfrc522{driver};

// Servo motor setup
Servo servo;
const int servoPin = 18;

// Ultra sonic setup
const int trigPin = 5;
const int echoPin = 7;
#define SOUND_SPEED 0.034
long duration;
float distance;
boolean isParkingSpotOccupied;

// LED setup
const int ledRed = 16;
const int ledGreen = 17;

// MQTT Client and timer handles
AsyncMqttClient mqttClient;
TimerHandle_t mqttReconnectTimer;
TimerHandle_t wifiReconnectTimer;
TimerHandle_t gateCloseTimer;

// Connect to WiFi
void connectToWifi()
{
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);
  delay(10000);
}

// Connect to MQTT broker
void connectToMqtt()
{
  Serial.println("Connecting to MQTT...");
  mqttClient.connect();
}

// WiFi event handler
void WiFiEvent(WiFiEvent_t event)
{
  switch (event)
  {
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
void onMqttConnect(bool sessionPresent)
{
  Serial.println("Connected to MQTT");
  // Subscribe to the "open gate" topic
  mqttClient.subscribe("cps/#", 2);
}

// MQTT disconnect callback
void onMqttDisconnect(AsyncMqttClientDisconnectReason reason)
{
  Serial.println("Disconnected from MQTT");
  if (WiFi.isConnected())
  {
    // Start MQTT reconnect timer if WiFi is still connected
    xTimerStart(mqttReconnectTimer, 0);
  }
}

// Timer callback to close the gate after a delay
void closeGate(TimerHandle_t xTimer)
{
  Serial.println("Closing gate...");
  // Rotate servo back to 0 degrees to close the gate
  servo.write(0);
}

// MQTT message callback
void onMqttMessage(char *topic, char *payload, AsyncMqttClientMessageProperties properties, size_t len, size_t index, size_t total)
{
  if (strcmp(topic, "cps/parking/gate/open") == 0)
  {
    Serial.println("Opening gate...");
    // Rotate servo to 90 degrees to open the gate
    servo.write(90);
    // Start timer to close the gate after 6 seconds
    xTimerStart(gateCloseTimer, 0);
  }
  if (strcmp(topic, "cps/parking/spot/isOccupied") == 0)
  {
    if (payload[0] == '1')
    {
      // Parking spot occupied -> set LED red
      digitalWrite(ledRed, HIGH);
      digitalWrite(ledGreen, LOW);
    }
    else if (payload[0] == '0')
    {
      // Parking spot not occupied -> Set LED green
      digitalWrite(ledRed, LOW);
      digitalWrite(ledGreen, HIGH);
    }
  }

  // Print received MQTT message
  Serial.print("Message received on Topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  for (int i = 0; i < len; i++)
  {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void setup()
{
  Serial.begin(115200);
  delay(1000);

  // Setup RFID
  mfrc522.PCD_Init();
  Serial.println(F("Scan PICC To See UID Of RFID-Chip"));

  // Setup Servo motor
  servo.attach(servoPin);

  // Setup ultrao sonic
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Setup LED
  pinMode(ledRed, OUTPUT);
  pinMode(ledGreen, OUTPUT);

  // Setup timers for MQTT, WiFi, and gate close
  mqttReconnectTimer = xTimerCreate("mqttTimer", pdMS_TO_TICKS(2000), pdFALSE, (void *)0, reinterpret_cast<TimerCallbackFunction_t>(connectToMqtt));
  wifiReconnectTimer = xTimerCreate("wifiTimer", pdMS_TO_TICKS(2000), pdFALSE, (void *)0, reinterpret_cast<TimerCallbackFunction_t>(connectToWifi));
  gateCloseTimer = xTimerCreate("gateTimer", pdMS_TO_TICKS(6000), pdFALSE, (void *)0, closeGate);

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

void loop()
{
  // --- RFID: Detect card and send UID ---
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial())
  {
    // Convert UID to string
    String uidString = "";
    for (byte i = 0; i < mfrc522.uid.size; i++)
    {
      if (mfrc522.uid.uidByte[i] < 0x10)
      {
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

  // --- Ultrasonic: Measure distance and publish ---
  // Clears the trigPin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  // Sets the trigPin on HIGH state for 10 micro seconds
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Reads the echoPin, returns the sound wave travel time in microseconds
  duration = pulseIn(echoPin, HIGH);

  // Calculate the distance
  distance = duration * SOUND_SPEED / 2;

  Serial.print("Distance (cm): ");
  Serial.println(distance);

  String payload = String(distance, 2);
  mqttClient.publish("backend/parking/spot/distance", 0, false, payload.c_str());

  // Small delay to avoid overloading the loop
  delay(200);
}