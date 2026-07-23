# 🌊 IoT Water Level Monitoring System

A modern, full-stack **IoT Water Level Monitoring & Automatic Pump Control System** built with **React (Vite)**, **Node.js (Express)**, **MySQL (Sequelize ORM)**, and **ESP8266 / ESP32 Microcontrollers** with **HC-SR04 Ultrasonic Distance Sensor**.

---

## 🌟 Key Features

- 💧 **Real-Time Water Level Monitoring:** Displays exact percentage, tank capacity, current water in liters, and ultrasonic measured distance in cm.
- ⚙️ **Automatic & Manual Pump Control:** Automatically turns the water pump **ON/OFF** based on configurable minimum/maximum thresholds or manual toggle.
- 📊 **Animated Tank Visualizer:** Dynamic wave animation filling the tank proportional to the water level.
- 📟 **IoT Device Heartbeat Management:** Live online/offline monitoring for ESP8266 / ESP32 sensor nodes.
- 📋 **Water Level Log Analytics:** Full telemetry log history table with search filtering and log deletion.
- 🔐 **JWT Authentication:** Admin user login with secure password hashing (`bcrypt`).
- 🎨 **Modern Dark Glassmorphism UI:** Built with custom Vanilla CSS design tokens.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** React 18 (Vite)
- **Styling:** Custom Vanilla CSS Design System (Glassmorphism & Responsive Grid)
- **HTTP Client:** Axios (with JWT Interceptors)
- **Routing:** React Router v6

### **Backend**
- **Runtime:** Node.js & Express.js
- **Database:** MySQL
- **ORM:** Sequelize (Auto-Sync & Schema Migration)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs

---

## 📁 Repository Structure

```
iot-water-level-monitoring/
├── backend/
│   ├── config/          # Database Connection & Auto DB Creation
│   ├── controllers/     # Water, Settings, Auth & Device Status Controllers
│   ├── middleware/      # Auth Guard & Global Error Handler
│   ├── models/          # Sequelize Models (User, Settings, WaterLog, DeviceStatus)
│   ├── routes/          # REST API Endpoints
│   ├── app.js           # Express App Configuration
│   ├── server.js        # Server Entry Point & Default Seeding
│   └── esp8266_code.ino # Arduino C++ Firmware Code for ESP8266
├── frontend/
│   ├── public/          # Static Assets
│   ├── src/
│   │   ├── components/  # WaterCard, WaterProgress, PumpStatus, Sidebar, Topbar
│   │   ├── pages/       # Dashboard, WaterLogs, DeviceStatus, Settings, Login
│   │   ├── services/    # Axios API Service
│   │   ├── App.jsx      # Main Application Router
│   │   └── index.css    # Full Width CSS System
│   ├── index.html       # Vite HTML Entry
│   └── vite.config.js   # Vite Server Proxy Config
└── README.md
```

---

## 🚀 Quick Setup Instructions

### 1️⃣ Database Setup
Make sure XAMPP / MySQL Server is running on port `3306`.
The backend will **automatically create** the database `iot_water_level_db` and seed default admin credentials on startup!

### 2️⃣ Backend Installation & Startup
```bash
cd backend
npm install
npm run dev
```
Backend API will start running at `http://localhost:5000`.

### 3️⃣ Frontend Installation & Startup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web App will start running at `http://localhost:3000`.

---

## 🔑 Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

---

## 🔌 ESP8266 Hardware Setup & API

Upload [`backend/esp8266_code.ino`](file:///d:/xampp/htdocs/iot-water-level-monitoring/backend/esp8266_code.ino) to your ESP8266 / ESP32 node via Arduino IDE.

**Endpoint:** `POST http://<YOUR_LAPTOP_IP>:5000/api/water`  
**JSON Payload:**
```json
{
  "device_id": "ESP8266_WATER_NODE_01",
  "device_name": "ESP8266 Water Sensor",
  "measured_distance_cm": 25.5
}
```

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
