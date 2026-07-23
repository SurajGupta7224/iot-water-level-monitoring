const DeviceStatus = require('../models/deviceStatusModel');

// Dynamic Timeout threshold: If no ping from hardware in 20 seconds, mark OFFLINE
const HEARTBEAT_TIMEOUT_MS = 20000;

// Get all device statuses
const getDeviceStatus = async (req, res) => {
  try {
    const devices = await DeviceStatus.findAll();
    const now = new Date();

    const evaluatedDevices = await Promise.all(
      devices.map(async (dev) => {
        const lastSeen = dev.last_seen ? new Date(dev.last_seen) : null;
        const isRecentlySeen = lastSeen && (now - lastSeen) < HEARTBEAT_TIMEOUT_MS;
        const currentStatus = isRecentlySeen ? 'ONLINE' : 'OFFLINE';

        if (dev.device_status !== currentStatus) {
          await dev.update({ device_status: currentStatus });
        }

        return {
          ...dev.toJSON(),
          device_status: currentStatus,
        };
      })
    );

    res.status(200).json({ success: true, data: evaluatedDevices });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch device status', error: err.message });
  }
};

// Update device status (ping/heartbeat from ESP8266/ESP32 hardware)
const updateDeviceStatus = async (req, res) => {
  try {
    const { device_id, device_name, device_status, ip_address, wifi_signal_strength, firmware_version } = req.body;

    if (!device_id) {
      return res.status(400).json({ success: false, message: 'device_id is required' });
    }

    const [device, created] = await DeviceStatus.findOrCreate({
      where: { device_id },
      defaults: {
        device_name: device_name || 'ESP8266 Water Sensor',
        device_status: 'ONLINE',
        ip_address: ip_address || req.ip || null,
        wifi_signal_strength: wifi_signal_strength || null,
        firmware_version: firmware_version || '1.0.0',
        last_seen: new Date(),
      },
    });

    if (!created) {
      await device.update({
        ...(device_name && { device_name }),
        device_status: 'ONLINE',
        ip_address: ip_address || req.ip || device.ip_address,
        ...(wifi_signal_strength !== undefined && { wifi_signal_strength }),
        ...(firmware_version && { firmware_version }),
        last_seen: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: created ? 'Device registered successfully' : 'Device heartbeat updated',
      data: device,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update device status', error: err.message });
  }
};

// Edit device details by ID
const editDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { device_name, device_id, firmware_version, ip_address } = req.body;

    const device = await DeviceStatus.findByPk(id);
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    await device.update({
      ...(device_name && { device_name }),
      ...(device_id && { device_id }),
      ...(firmware_version && { firmware_version }),
      ...(ip_address && { ip_address }),
    });

    res.status(200).json({ success: true, message: 'Device updated successfully', data: device });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to edit device', error: err.message });
  }
};

// Delete device node by ID
const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DeviceStatus.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }
    res.status(200).json({ success: true, message: 'Device deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete device', error: err.message });
  }
};

module.exports = {
  getDeviceStatus,
  updateDeviceStatus,
  editDevice,
  deleteDevice,
};
