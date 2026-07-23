const WaterLog = require('../models/waterLogModel');
const Settings = require('../models/settingsModel');
const DeviceStatus = require('../models/deviceStatusModel');

// Helper to determine tank status dynamically
const calculateTankStatus = (percentage) => {
  const p = Math.min(Math.max(Number(percentage) || 0, 0), 100);
  if (p <= 20) return 'Empty';
  if (p <= 40) return 'Low';
  if (p <= 80) return 'Medium';
  return 'Full';
};

// Get all water level logs
const getAllReadings = async (req, res) => {
  try {
    const logs = await WaterLog.findAll({ order: [['created_at', 'DESC']] });
    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch readings', error: err.message });
  }
};

// Get latest water level log
const getLatestReading = async (req, res) => {
  try {
    const latest = await WaterLog.findOne({ order: [['created_at', 'DESC']] });
    res.status(200).json({ success: true, data: latest });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch latest reading', error: err.message });
  }
};

// Get reading by ID
const getReadingById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await WaterLog.findByPk(id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Reading not found' });
    }
    res.status(200).json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reading', error: err.message });
  }
};

// Add a new water level log (from ESP8266 sensor or manual trigger)
const addReading = async (req, res) => {
  try {
    const {
      water_level_percentage,
      water_level,
      current_water_liters,
      measured_distance_cm,
      tank_status,
      pump_status,
      device_id,
    } = req.body;

    // Load active tank settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = {
        tank_height_cm: 100.0,
        tank_capacity_liters: 1000.0,
        minimum_water_level_percentage: 20.0,
        maximum_water_level_percentage: 90.0,
        auto_pump: false,
      };
    }

    const tankHeight = parseFloat(settings.tank_height_cm) || 100.0;
    const tankCapacity = parseFloat(settings.tank_capacity_liters) || 1000.0;

    let computedPercentage = water_level_percentage ?? water_level;
    let computedDistance = measured_distance_cm !== undefined ? parseFloat(measured_distance_cm) : null;

    // If HC-SR04 distance is sent, calculate percentage dynamically
    if (computedDistance !== null && computedPercentage === undefined) {
      const waterHeight = Math.max(0, tankHeight - computedDistance);
      computedPercentage = (waterHeight / tankHeight) * 100.0;
    }

    if (computedPercentage === undefined) {
      computedPercentage = 0.0;
    }

    computedPercentage = Math.min(Math.max(parseFloat(computedPercentage) || 0, 0), 100);

    // Dynamically calculate current water in liters
    const computedLiters = current_water_liters !== undefined
      ? parseFloat(current_water_liters)
      : parseFloat(((computedPercentage / 100.0) * tankCapacity).toFixed(1));

    // Dynamically calculate tank status (Empty / Low / Medium / Full)
    const computedTankStatus = tank_status || calculateTankStatus(computedPercentage);

    // Auto Pump logic based on settings
    let finalPumpStatus = pump_status || 'OFF';
    if (settings.auto_pump) {
      if (computedPercentage <= settings.minimum_water_level_percentage) {
        finalPumpStatus = 'ON';
      } else if (computedPercentage >= settings.maximum_water_level_percentage) {
        finalPumpStatus = 'OFF';
      }
    }

    // Save dynamic log record into MySQL
    const newLog = await WaterLog.create({
      water_level_percentage: computedPercentage,
      current_water_liters: computedLiters,
      measured_distance_cm: computedDistance,
      tank_status: computedTankStatus,
      pump_status: finalPumpStatus,
    });

    // Update Device Status heartbeat if device_id is provided
    if (device_id) {
      const [device] = await DeviceStatus.findOrCreate({
        where: { device_id },
        defaults: {
          device_name: 'ESP8266 Water Sensor',
          device_status: 'ONLINE',
          last_seen: new Date(),
        },
      });
      await device.update({ device_status: 'ONLINE', last_seen: new Date() });
    }

    res.status(201).json({
      success: true,
      message: 'Reading logged dynamically to MySQL',
      data: newLog,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save reading', error: err.message });
  }
};

// Delete a reading
const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WaterLog.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Reading not found' });
    }
    res.status(200).json({ success: true, message: 'Reading deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete reading', error: err.message });
  }
};

module.exports = {
  getAllReadings,
  getLatestReading,
  getReadingById,
  addReading,
  deleteReading,
};
