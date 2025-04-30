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
  mqttClient.subscribe("parking/gate/open", 0);
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
  if (strcmp(topic, "parking/gate/open") == 0)
  {
    Serial.println("Opening gate...");
    // Rotate servo to 90 degrees to open the gate
    servo.write(90);
    // Start timer to close the gate after 6 seconds
    xTimerStart(gateCloseTimer, 0);
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

  // Initialize RFID
  mfrc522.PCD_Init();
  Serial.println(F("Scan PICC to see UID, SAK, type, and data blocks..."));

  // Setup Servo motor
  servo.attach(servoPin);

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
  // Check if a new RFID card is present
  if (!mfrc522.PICC_IsNewCardPresent())
  {
    // No new card
    return;
  }

  if (!mfrc522.PICC_ReadCardSerial())
  {
    // Failed to read card serial
    return;
  }

  // Convert the UID of the RFID card to a string
  String uidString = "";
  for (byte i = 0; i < mfrc522.uid.size; i++)
  {
    if (mfrc522.uid.uidByte[i] < 0x10)
    {
      // Add leading zero for hex digits
      uidString += "0";
    }
    // Convert to hex
    uidString += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidString.toUpperCase();
  Serial.println("UID: " + uidString);

  // Publish RFID UID to MQTT for validation
  mqttClient.publish("parking/gate/validation/rfid", 0, false, uidString.c_str());

  // Deactivate the tag
  mfrc522.PICC_HaltA();
  // Stop encryption
  mfrc522.PCD_StopCrypto1();
}