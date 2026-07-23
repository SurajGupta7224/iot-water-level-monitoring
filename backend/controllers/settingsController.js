const Settings = require('../models/settingsModel');
const User = require('../models/userModel');

// Get system settings (Accessible by Dashboard/Settings UI and ESP8266)
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        tank_height_cm: 100.0,
        tank_capacity_liters: 1000.0,
        minimum_water_level_percentage: 20.0,
        maximum_water_level_percentage: 90.0,
        auto_pump: false,
        wifi_ssid: '',
        wifi_password: '',
      });
    }

    // Optionally include current admin username
    const adminUser = await User.findOne();
    const data = {
      ...settings.toJSON(),
      username: adminUser ? adminUser.username : 'admin',
    };

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings', error: err.message });
  }
};

// Update system settings (Settings Page)
const updateSettings = async (req, res) => {
  try {
    const {
      tank_height_cm,
      tank_capacity_liters,
      minimum_water_level_percentage,
      maximum_water_level_percentage,
      auto_pump,
      wifi_ssid,
      wifi_password,
      username,
      password,
    } = req.body;

    let settings = await Settings.findOne();
    const settingsPayload = {
      ...(tank_height_cm !== undefined && { tank_height_cm: parseFloat(tank_height_cm) }),
      ...(tank_capacity_liters !== undefined && { tank_capacity_liters: parseFloat(tank_capacity_liters) }),
      ...(minimum_water_level_percentage !== undefined && { minimum_water_level_percentage: parseFloat(minimum_water_level_percentage) }),
      ...(maximum_water_level_percentage !== undefined && { maximum_water_level_percentage: parseFloat(maximum_water_level_percentage) }),
      ...(auto_pump !== undefined && { auto_pump: Boolean(auto_pump) }),
      ...(wifi_ssid !== undefined && { wifi_ssid }),
      ...(wifi_password !== undefined && { wifi_password }),
    };

    if (!settings) {
      settings = await Settings.create(settingsPayload);
    } else {
      await settings.update(settingsPayload);
    }

    // Update Admin Username/Password if provided
    if (username || password) {
      let adminUser = await User.findOne();
      if (!adminUser) {
        await User.create({
          username: username || 'admin',
          password: password || 'admin123',
        });
      } else {
        if (username) adminUser.username = username;
        if (password && password.trim() !== '') adminUser.password = password;
        await adminUser.save();
      }
    }

    const updatedUser = await User.findOne();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        ...settings.toJSON(),
        username: updatedUser ? updatedUser.username : 'admin',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update settings', error: err.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
