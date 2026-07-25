# 🌊 IoT Water Level Monitoring System - Complete API Documentation

> **ChatGPT Prompt Instructions:**  
> Copy and paste this document into ChatGPT when asking for code generation, frontend components, mobile apps, or hardware integrations. This document contains all REST API endpoints, request/response formats, models, authentication methods, and database schemas for the IoT Water Level Monitoring backend.

---

## 📌 Base Configuration

- **Base URL:** `http://localhost:5000` *(or your server domain/IP)*
- **API Prefix:** `/api`
- **Content-Type:** `application/json`
- **Authentication:** JWT Bearer Token passed via HTTP Header: `Authorization: Bearer <YOUR_JWT_TOKEN>`

---

## 🔐 1. Authentication API (`/api/auth`)

### 1.1 User Login
Authenticates a user and returns a JWT token (valid for 7 days).

- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "adminpassword"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin"
    }
  }
  ```
- **Response Error (401 Unauthorized / 400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Invalid username or password"
  }
  ```

---

### 1.2 Get Current Profile (`getMe`)
Returns profile info for the logged-in user.

- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Auth Required:** Yes (`Authorization: Bearer <token>`)
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "username": "admin",
      "createdAt": "2026-07-25T17:00:00.000Z",
      "updatedAt": "2026-07-25T17:00:00.000Z"
    }
  }
  ```

---

## 💧 2. Water Level Readings API (`/api/water`)

### 2.1 Get All Water Logs
Retrieves historical logs ordered by most recent first (`created_at DESC`).

- **Method:** `GET`
- **Endpoint:** `/api/water`
- **Auth Required:** Optional / Public
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 15,
        "water_level_percentage": 75.5,
        "current_water_liters": 755.0,
        "measured_distance_cm": 24.5,
        "tank_status": "Medium",
        "pump_status": "OFF",
        "created_at": "2026-07-25T22:50:00.000Z"
      }
    ]
  }
  ```

---

### 2.2 Get Latest Water Log
Retrieves the single latest reading recorded by the system.

- **Method:** `GET`
- **Endpoint:** `/api/water/latest`
- **Auth Required:** Optional / Public
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 15,
      "water_level_percentage": 75.5,
      "current_water_liters": 755.0,
      "measured_distance_cm": 24.5,
      "tank_status": "Medium",
      "pump_status": "OFF",
      "created_at": "2026-07-25T22:50:00.000Z"
    }
  }
  ```

---

### 2.3 Get Reading by ID
Fetch a single water level reading by primary key.

- **Method:** `GET`
- **Endpoint:** `/api/water/:id`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 5,
      "water_level_percentage": 40.0,
      "current_water_liters": 400.0,
      "measured_distance_cm": 60.0,
      "tank_status": "Low",
      "pump_status": "ON",
      "created_at": "2026-07-25T20:00:00.000Z"
    }
  }
  ```

---

### 2.4 Add New Reading (Sensor / Manual Ping)
Posts sensor data from an ESP8266/ESP32 hardware node or manual frontend trigger.  
*Calculates water liters, percentage, tank status (`Empty`, `Low`, `Medium`, `Full`), and triggers auto-pump logic dynamically based on system settings.*

- **Method:** `POST`
- **Endpoint:** `/api/water`
- **Request Body (Sending Sensor Distance in CM):**
  ```json
  {
    "measured_distance_cm": 25.0,
    "device_id": "ESP8266_WATER_01"
  }
  ```
- **Request Body (Sending Direct Percentage):**
  ```json
  {
    "water_level_percentage": 85.0,
    "pump_status": "OFF",
    "device_id": "ESP8266_WATER_01"
  }
  ```
- **Response Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "Reading logged dynamically to MySQL",
    "data": {
      "id": 16,
      "water_level_percentage": 75.0,
      "current_water_liters": 750.0,
      "measured_distance_cm": 25.0,
      "tank_status": "Medium",
      "pump_status": "OFF",
      "created_at": "2026-07-25T23:00:00.000Z"
    }
  }
  ```

---

### 2.5 Delete Reading
Deletes a specific log record by ID.

- **Method:** `DELETE`
- **Endpoint:** `/api/water/:id`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Reading deleted successfully"
  }
  ```

---

## ⚙️ 3. System Settings API (`/api/settings`)

### 3.1 Get Settings
Fetch system-wide configurations (tank dimensions, auto-pump thresholds, WiFi credentials, admin user name).

- **Method:** `GET`
- **Endpoint:** `/api/settings`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "tank_height_cm": 100.0,
      "tank_capacity_liters": 1000.0,
      "minimum_water_level_percentage": 20.0,
      "maximum_water_level_percentage": 90.0,
      "auto_pump": true,
      "wifi_ssid": "Home_WiFi",
      "wifi_password": "SecretPassword123",
      "username": "admin",
      "created_at": "2026-07-25T17:00:00.000Z",
      "updated_at": "2026-07-25T22:00:00.000Z"
    }
  }
  ```

---

### 3.2 Update Settings
Updates system parameters (tank capacity, threshold limits, auto-pump mode, WiFi, admin credentials).

- **Method:** `POST` or `PUT`
- **Endpoint:** `/api/settings`
- **Request Body (All fields optional):**
  ```json
  {
    "tank_height_cm": 120.0,
    "tank_capacity_liters": 1500.0,
    "minimum_water_level_percentage": 25.0,
    "maximum_water_level_percentage": 95.0,
    "auto_pump": true,
    "wifi_ssid": "New_WiFi_SSID",
    "wifi_password": "New_WiFi_Password",
    "username": "new_admin",
    "password": "new_secure_password"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Settings updated successfully",
    "data": {
      "id": 1,
      "tank_height_cm": 120.0,
      "tank_capacity_liters": 1500.0,
      "minimum_water_level_percentage": 25.0,
      "maximum_water_level_percentage": 95.0,
      "auto_pump": true,
      "wifi_ssid": "New_WiFi_SSID",
      "wifi_password": "New_WiFi_Password",
      "username": "new_admin",
      "updated_at": "2026-07-25T23:00:00.000Z"
    }
  }
  ```

---

## 📡 4. Device Status & Heartbeat API (`/api/device-status`)

### 4.1 Get All Devices Status
Lists connected microcontrollers (ESP8266/ESP32). Devices with no ping in >20 seconds are automatically marked as `OFFLINE`.

- **Method:** `GET`
- **Endpoint:** `/api/device-status`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "device_name": "ESP8266 Main Tank Sensor",
        "device_id": "ESP8266_WATER_01",
        "device_status": "ONLINE",
        "ip_address": "192.168.1.50",
        "wifi_signal_strength": -65,
        "firmware_version": "1.0.0",
        "last_seen": "2026-07-25T23:01:10.000Z",
        "created_at": "2026-07-25T17:00:00.000Z",
        "updated_at": "2026-07-25T23:01:10.000Z"
      }
    ]
  }
  ```

---

### 4.2 Update Device Heartbeat (Ping from Hardware)
Registers a hardware device or updates its online heartbeat state and telemetry.

- **Method:** `POST`
- **Endpoint:** `/api/device-status`
- **Request Body:**
  ```json
  {
    "device_id": "ESP8266_WATER_01",
    "device_name": "ESP8266 Main Tank Sensor",
    "ip_address": "192.168.1.50",
    "wifi_signal_strength": -62,
    "firmware_version": "1.0.0"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Device heartbeat updated",
    "data": {
      "id": 1,
      "device_id": "ESP8266_WATER_01",
      "device_name": "ESP8266 Main Tank Sensor",
      "device_status": "ONLINE",
      "ip_address": "192.168.1.50",
      "wifi_signal_strength": -62,
      "firmware_version": "1.0.0",
      "last_seen": "2026-07-25T23:01:30.000Z"
    }
  }
  ```

---

### 4.3 Edit Device Details
Updates device naming or firmware info by database ID.

- **Method:** `PUT`
- **Endpoint:** `/api/device-status/:id`
- **Request Body:**
  ```json
  {
    "device_name": "Overhead Tank Sensor Node 1",
    "firmware_version": "1.1.0"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Device updated successfully",
    "data": { ... }
  }
  ```

---

### 4.4 Delete Device Node
Removes a registered device node by ID.

- **Method:** `DELETE`
- **Endpoint:** `/api/device-status/:id`
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Device deleted successfully"
  }
  ```

---

## 🗄️ 5. Database Schema Reference

| Table Name | Key Column | Key Attributes & Types |
| :--- | :--- | :--- |
| `users` | `id` (INT PK) | `username` (VARCHAR, UNIQUE), `password` (VARCHAR, hashed with bcrypt) |
| `water_logs` | `id` (INT PK) | `water_level_percentage` (FLOAT), `current_water_liters` (FLOAT), `measured_distance_cm` (FLOAT), `tank_status` ('Empty'/'Low'/'Medium'/'Full'), `pump_status` ('ON'/'OFF'), `created_at` (DATETIME) |
| `settings` | `id` (INT PK) | `tank_height_cm` (FLOAT), `tank_capacity_liters` (FLOAT), `minimum_water_level_percentage` (FLOAT), `maximum_water_level_percentage` (FLOAT), `auto_pump` (BOOLEAN), `wifi_ssid` (VARCHAR), `wifi_password` (VARCHAR) |
| `device_status` | `id` (INT PK) | `device_name` (VARCHAR), `device_id` (VARCHAR UNIQUE), `device_status` ('ONLINE'/'OFFLINE'), `ip_address` (VARCHAR), `wifi_signal_strength` (INT), `firmware_version` (VARCHAR), `last_seen` (DATETIME) |

---

## 🚀 6. Prompt Example to give ChatGPT

```text
Hi ChatGPT! I have an IoT Water Level Monitoring System.
Here is the full API Documentation and Schema:

[PASTE THIS ENTIRE API_DOCUMENTATION.MD FILE HERE]

Please help me build [Your Request Here, e.g. a React dashboard component / ESP8266 Arduino code / Mobile app integration].
```
