#include <WiFi.h>
#include <AsyncMQTT_ESP32.h>
#include <MFRC522v2.h>
#include <MFRC522DriverSPI.h>
#include <MFRC522DriverPinSimple.h>


// WiFi configuration
const char *ssid = "BerufsschuleProjekte";
const char *password = "berufsschule";

// MQTT configuration
const char *mqtt_server = "gruppe1iot-dev.local";
const int mqtt_port = 1883;
const char *mqtt_user = "gruppe1";
const char *mqtt_password = "gruppe1";


// RFID setup
MFRC522DriverPinSimple ss_pin(5);
MFRC522DriverSPI driver{ss_pin};
MFRC522 mfrc522{driver};

// MQTT Client and timer handles
AsyncMqttClient mqttClient;
TimerHandle_t mqttReconnectTimer;
TimerHandle_t wifiReconnectTimer;
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

void setup() {
  Serial.begin(115200);  // Initialize serial communication
  delay(1000);

  // Setup RFID
  mfrc522.PCD_Init();
  Serial.println(F("Scan PICC to see UID..."));


// Setup timers for MQTT, WiFi, and gate close
  mqttReconnectTimer = xTimerCreate("mqttTimer", pdMS_TO_TICKS(2000), pdFALSE, (void *)0, reinterpret_cast<TimerCallbackFunction_t>(connectToMqtt));
  wifiReconnectTimer = xTimerCreate("wifiTimer", pdMS_TO_TICKS(2000), pdFALSE, (void *)0, reinterpret_cast<TimerCallbackFunction_t>(connectToWifi));

  // Setup WiFi event handler
  WiFi.onEvent(WiFiEvent);

   // Setup MQTT client
  mqttClient.onConnect(onMqttConnect);
  mqttClient.onDisconnect(onMqttDisconnect);
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCredentials(mqtt_user, mqtt_password);
  mqttClient.setClientId("MqttClientAdminRFID");

  // Connect to WiFi
  connectToWifi();
}

void loop() {
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
    mqttClient.publish("backend/admin/rfid", 0, false, uidString.c_str());

    // Deactivate the card
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
  }
    // Small delay to avoid overloading the loop
  delay(1000);
}