#include <WiFi.h>
#include <AsyncMQTT_ESP32.h>

// WiFi configuration
const char *ssid = "BerufsschuleProjekte";
const char *password = "berufsschule";

// MQTT configuration
const char *mqtt_server = "gruppe1iot-dev.local";
const int mqtt_port = 1883;
const char *mqtt_user = "gruppe1";
const char *mqtt_password = "gruppe1";

// Ultra sonic setup
const int trigPinSpotA1 = 5;
const int echoPinSpotA1 = 18;

const int trigPinSpotA2 = 32;
const int echoPinSpotA2 = 33;

const int trigPinSpotA3 = 26;
const int echoPinSpotA3 = 27;

const int trigPinSpotA4 = 12;
const int echoPinSpotA4 = 13;


#define SOUND_SPEED 0.034
long durationA1;
float distanceA1;
long durationA2;
float distanceA2;
long durationA3;
float distanceA3;
long durationA4;
float distanceA4;
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
}

// MQTT disconnect callback
void onMqttDisconnect(AsyncMqttClientDisconnectReason reason) {
  Serial.println("Disconnected from MQTT");
  if (WiFi.isConnected()) {
    // Start MQTT reconnect timer if WiFi is still connected
    xTimerStart(mqttReconnectTimer, 0);
  }
}


void setup() {
  Serial.begin(115200);
  delay(1000);


  // Setup ultra sonic
  pinMode(trigPinSpotA1, OUTPUT);
  pinMode(echoPinSpotA1, INPUT);

  pinMode(trigPinSpotA2, OUTPUT);
  pinMode(echoPinSpotA2, INPUT);
  
  pinMode(trigPinSpotA3, OUTPUT);
  pinMode(echoPinSpotA3, INPUT);

  pinMode(trigPinSpotA4, OUTPUT);
  pinMode(echoPinSpotA4, INPUT);

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
  mqttClient.setClientId("ESP32SonicSensorParking");

  // Connect to WiFi
  connectToWifi();
}

void loop() {
 
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

  // Ultra Sonic Sensor A3
  digitalWrite(trigPinSpotA3, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPinSpotA3, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPinSpotA3, LOW);
  durationA3 = pulseIn(echoPinSpotA3, HIGH);
  distanceA3 = durationA3 * SOUND_SPEED / 2;

  delay(50);

  // Ultra Sonic Sensor A4
  digitalWrite(trigPinSpotA4, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPinSpotA4, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPinSpotA4, LOW);
  durationA4 = pulseIn(echoPinSpotA4, HIGH);
  distanceA4 = durationA4 * SOUND_SPEED / 2;


  Serial.print("DistanceA1 (cm): ");
  Serial.println(distanceA1);


  Serial.print("DistanceA2 (cm): ");
  Serial.println(distanceA2);

  Serial.print("DistanceA3 (cm): ");
  Serial.println(distanceA3);

    Serial.print("DistanceA4 (cm): ");
  Serial.println(distanceA4);

  String payloadA1 = String(distanceA1, 2);
  mqttClient.publish("backend/parking/distance/spot/A1", 0, false, payloadA1.c_str());

  String payloadA2 = String(distanceA2, 2);
  mqttClient.publish("backend/parking/distance/spot/A2", 0, false, payloadA2.c_str());

  String payloadA3 = String(distanceA3, 2);
  mqttClient.publish("backend/parking/distance/spot/A3", 0, false, payloadA3.c_str());

  String payloadA4 = String(distanceA4, 2);
  mqttClient.publish("backend/parking/distance/spot/A4", 0, false, payloadA4.c_str());
  // Small delay to avoid overloading the loop
  delay(500);
}