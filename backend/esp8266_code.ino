/*
  🌊 IoT Water Level Monitoring - ESP8266 Code
  Hardware Required:
  - ESP8266 (NodeMCU / Wemos D1 Mini)
  - HC-SR04 Ultrasonic Distance Sensor (TrigPin: D5, EchoPin: D6)
  - Relay Module for Water Pump (RelayPin: D1)
*/

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// ─── Configuration ────────────────────────────────────────────────────────────
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Replace with your Laptop/Server IP address (e.g. http://192.168.1.100:5000)
const char* serverUrl = "http://192.168.1.100:5000/api/water";

#define TRIG_PIN D5
#define ECHO_PIN D6
#define RELAY_PIN D1

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

float measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = duration * 0.034 / 2;
  return distance;
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    float distance = measureDistance();
    Serial.print("Measured Distance: ");
    Serial.print(distance);
    Serial.println(" cm");

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["device_id"] = "ESP8266_WATER_NODE_01";
    doc["device_name"] = "ESP8266 Water Sensor";
    doc["measured_distance_cm"] = distance;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    Serial.print("Server Response Code: ");
    Serial.println(httpResponseCode);

    http.end();
  }

  delay(5000); // Send heartbeat every 5 seconds
}
