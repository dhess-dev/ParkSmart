#include <WiFi.h>
#include <PubSubClient.h>
#include <MFRC522v2.h>
#include <MFRC522DriverSPI.h>
#include <MFRC522DriverPinSimple.h>

// WiFi
const char *ssid = "FES-SuS";  
const char *password = "SuS-WLAN!Key24";  

// MQTT
const char *mqtt_server = "192.168.2.189"; 
const int mqtt_port = 1883; 
const char *mqtt_user = "gruppe1";  
const char *mqtt_password = "gruppe1";  
const char *mqtt_topic = "testTopic";  

WiFiClient espClient;
PubSubClient client(espClient);

MFRC522DriverPinSimple ss_pin(8);
MFRC522DriverSPI driver{ss_pin};
MFRC522 mfrc522{driver};

void setup() {
  Serial.begin(115200);  // Initialize serial communication
  while (!Serial);       // Wait until the serial communication is ready

  mfrc522.PCD_Init();    // Initialize the MFRC522 Reader
  Serial.println(F("Scan PICC to see UID, SAK, type, and data blocks..."));

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to Wi-Fi...");
  }
  Serial.println("Wi-Fi connected!");

  // Configure MQTT client
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  // Read RFID tag
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  String uidString = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) {
      uidString += "0";  // Add leading zero for hex digits
    }
    uidString += String(mfrc522.uid.uidByte[i], HEX);
  }

  uidString.toUpperCase();
  Serial.println("UID: " + uidString);

  // Send MQTT message
  client.publish(mqtt_topic, uidString.c_str());

  mfrc522.PICC_HaltA(); // Deactivate the tag
  mfrc522.PCD_StopCrypto1(); // Stop encryption
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Attempting to connect to MQTT...");
    if (client.connect("ESP32Client", mqtt_user, mqtt_password)) {
      Serial.println("Connected to MQTT Broker");

      client.subscribe(mqtt_topic);
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // This function is called when a message is received
  Serial.print("Message received on Topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}