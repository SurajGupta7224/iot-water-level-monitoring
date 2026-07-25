/*
=========================================================
 IoT Water Level Monitoring System
 ESP8266 NodeMCU - Final Fixed Code (Render HTTPS Sync)
=========================================================
*/

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

/*=========================================================
                    WIFI CONFIGURATION
=========================================================*/

const char* WIFI_SSID = "Suraj";
const char* WIFI_PASSWORD = "12345678";

/*=========================================================
                    SERVER CONFIGURATION
=========================================================*/

const char* SERVER_BASE_URL = "https://iot-water-level-monitoring-nto3.onrender.com";

const char* DEVICE_ID   = "ESP8266_WATER_NODE_01";
const char* DEVICE_NAME = "NodeMCU Water Level Sensor";

/*=========================================================
                      PIN DEFINITIONS
=========================================================*/

#define TRIG_PIN    D5
#define ECHO_PIN    D6
#define RELAY_PIN   D1
#define STATUS_LED  D2

/*=========================================================
                    GLOBAL VARIABLES
=========================================================*/

unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL_MS = 5000;

float tankHeightCm = 100.0;
float minLevelPct = 20.0;
float maxLevelPct = 90.0;

bool autoPumpEnabled = false;
bool currentPumpStatus = false;

/*=========================================================
                  FUNCTION DECLARATIONS
=========================================================*/

void connectWiFi();
float readUltrasonicDistance();
void sendWaterDataAndHeartbeat(float distanceCm);
void fetchSystemSettings();
void updatePumpState(bool turnOn);

/*=========================================================
                         SETUP
=========================================================*/

void setup()
{
    Serial.begin(115200);
    delay(1000);

    Serial.println();
    Serial.println("====================================");
    Serial.println(" IoT Water Level Monitoring System ");
    Serial.println("====================================");

    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(RELAY_PIN, OUTPUT);
    pinMode(STATUS_LED, OUTPUT);

    digitalWrite(RELAY_PIN, LOW);
    digitalWrite(STATUS_LED, LOW);

    connectWiFi();

    if (WiFi.status() == WL_CONNECTED)
    {
        fetchSystemSettings();
    }
}

/*=========================================================
                       MAIN LOOP
=========================================================*/

void loop()
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println();
        Serial.println("WiFi Lost!");
        connectWiFi();
        return;
    }

    digitalWrite(STATUS_LED, HIGH);

    if (millis() - lastSendTime >= SEND_INTERVAL_MS)
    {
        lastSendTime = millis();
        float distance = readUltrasonicDistance();

        Serial.print("Distance : ");
        Serial.print(distance);
        Serial.println(" cm");

        sendWaterDataAndHeartbeat(distance);
    }

    delay(20);
}

/*=========================================================
                  WIFI CONNECTION FUNCTION
=========================================================*/

void connectWiFi()
{
    WiFi.mode(WIFI_STA);
    WiFi.disconnect();
    delay(1000);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to WiFi");

    int retry = 0;
    while (WiFi.status() != WL_CONNECTED && retry < 40)
    {
        delay(500);
        Serial.print(".");
        digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
        retry++;
    }

    Serial.println();

    if (WiFi.status() == WL_CONNECTED)
    {
        digitalWrite(STATUS_LED, HIGH);
        Serial.println("WiFi Connected");
        Serial.print("IP Address : ");
        Serial.println(WiFi.localIP());
        Serial.print("RSSI : ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
    }
    else
    {
        digitalWrite(STATUS_LED, LOW);
        Serial.println("WiFi Connection Failed");
    }
}   

/*=========================================================
            ULTRASONIC DISTANCE MEASUREMENT
=========================================================*/

float readUltrasonicDistance()
{
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);

    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);

    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH, 30000);

    if (duration == 0)
    {
        Serial.println("Ultrasonic Timeout");
        return tankHeightCm;
    }

    float distance = (duration * 0.0343) / 2.0;

    if (distance < 0)
        distance = 0;

    if (distance > tankHeightCm)
        distance = tankHeightCm;

    return distance;
}

/*=========================================================
          SEND SENSOR DATA + HEARTBEAT TO SERVER
=========================================================*/

void sendWaterDataAndHeartbeat(float distanceCm)
{
    if (WiFi.status() != WL_CONNECTED)
        return;

    WiFiClientSecure client;
    client.setInsecure(); // Required for HTTPS (Render)

    HTTPClient http;

    /**************************************************
                  WATER DATA API
    **************************************************/

    String waterUrl = String(SERVER_BASE_URL) + "/api/water";

    Serial.println("--------------------------------");
    Serial.println("Uploading Water Data...");
    Serial.println(waterUrl);

    http.setTimeout(15000);

    if (http.begin(client, waterUrl))
    {
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<256> doc;

        doc["device_id"] = DEVICE_ID;
        doc["device_name"] = DEVICE_NAME;
        doc["measured_distance_cm"] = distanceCm;
        // NOTE: pump_status removed from payload so ESP does NOT override web dashboard ON state

        String body;
        serializeJson(doc, body);

        int httpCode = http.POST(body);

        Serial.print("HTTP Code : ");
        Serial.println(httpCode);

        if (httpCode > 0)
        {
            String response = http.getString();
            Serial.println("Server Response:");
            Serial.println(response);

            StaticJsonDocument<512> responseDoc;

            if (!deserializeJson(responseDoc, response))
            {
                if (responseDoc.containsKey("data"))
                {
                    const char* pump = responseDoc["data"]["pump_status"];

                    if (pump != nullptr)
                    {
                        if (String(pump) == "ON")
                        {
                            updatePumpState(true);
                        }
                        else
                        {
                            updatePumpState(false);
                        }
                    }
                }
            }
        }
        else
        {
            Serial.print("POST Failed : ");
            Serial.println(http.errorToString(httpCode));
        }

        http.end();
    }

    /**************************************************
                    HEARTBEAT API
    **************************************************/

    String heartbeatUrl = String(SERVER_BASE_URL) + "/api/device-status";
    Serial.println("Sending Heartbeat...");

    if (http.begin(client, heartbeatUrl))
    {
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<256> hb;
        hb["device_id"] = DEVICE_ID;
        hb["device_name"] = DEVICE_NAME;
        hb["device_status"] = "ONLINE";
        hb["ip_address"] = WiFi.localIP().toString();
        hb["wifi_signal_strength"] = WiFi.RSSI();
        hb["firmware_version"] = "1.0.0";

        String heartbeatBody;
        serializeJson(hb, heartbeatBody);

        int hbCode = http.POST(heartbeatBody);
        Serial.print("Heartbeat HTTP Code : ");
        Serial.println(hbCode);

        if (hbCode > 0)
        {
            Serial.println(http.getString());
        }
        else
        {
            Serial.print("Heartbeat Failed : ");
            Serial.println(http.errorToString(hbCode));
        }

        http.end();
    }

    Serial.println("--------------------------------");
}  

/*=========================================================
            FETCH SETTINGS FROM SERVER
=========================================================*/

void fetchSystemSettings()
{
    if (WiFi.status() != WL_CONNECTED)
        return;

    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;

    String url = String(SERVER_BASE_URL) + "/api/settings";

    Serial.println("--------------------------------");
    Serial.println("Fetching System Settings...");
    Serial.println(url);

    http.setTimeout(15000);

    if (http.begin(client, url))
    {
        int httpCode = http.GET();

        Serial.print("HTTP Code : ");
        Serial.println(httpCode);

        if (httpCode > 0)
        {
            String response = http.getString();
            Serial.println("Settings Response:");
            Serial.println(response);

            StaticJsonDocument<512> doc;

            DeserializationError error = deserializeJson(doc, response);

            if (!error)
            {
                if (doc["success"] == true)
                {
                    tankHeightCm = doc["data"]["tank_height_cm"] | 100.0;
                    minLevelPct = doc["data"]["minimum_water_level_percentage"] | 20.0;
                    maxLevelPct = doc["data"]["maximum_water_level_percentage"] | 90.0;
                    autoPumpEnabled = doc["data"]["auto_pump"] | false;

                    Serial.println();
                    Serial.println("===== SETTINGS LOADED =====");
                    Serial.print("Tank Height : ");
                    Serial.print(tankHeightCm);
                    Serial.println(" cm");
                    Serial.print("Minimum Level : ");
                    Serial.print(minLevelPct);
                    Serial.println("%");
                    Serial.print("Maximum Level : ");
                    Serial.print(maxLevelPct);
                    Serial.println("%");
                    Serial.print("Auto Pump : ");

                    if(autoPumpEnabled)
                        Serial.println("Enabled");
                    else
                        Serial.println("Disabled");

                    Serial.println("===========================");
                }
                else
                {
                    Serial.println("Server returned success=false");
                }
            }
            else
            {
                Serial.print("JSON Error : ");
                Serial.println(error.c_str());
            }
        }
        else
        {
            Serial.print("GET Failed : ");
            Serial.println(http.errorToString(httpCode));
        }

        http.end();
    }

    Serial.println("--------------------------------");
}

/*=========================================================
                UPDATE PUMP STATE
=========================================================*/

void updatePumpState(bool turnOn)
{
    Serial.print("updatePumpState called with: ");
    Serial.println(turnOn ? "ON" : "OFF");

    currentPumpStatus = turnOn;

    digitalWrite(RELAY_PIN, turnOn ? HIGH : LOW);

    Serial.print("Current Pump Status = ");
    Serial.println(currentPumpStatus ? "ON" : "OFF");
}

/*=========================================================
                OPTIONAL WATER LEVEL FUNCTION
=========================================================*/

float getWaterLevelPercentage(float distanceCm)
{
    float level = tankHeightCm - distanceCm;
    float percentage = (level / tankHeightCm) * 100.0;

    if(percentage < 0)
        percentage = 0;

    if(percentage > 100)
        percentage = 100;

    return percentage;
}

/*=========================================================
                    END OF PROGRAM
=========================================================*/
