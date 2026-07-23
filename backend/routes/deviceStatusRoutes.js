const express = require('express');
const router = express.Router();
const {
  getDeviceStatus,
  updateDeviceStatus,
  editDevice,
  deleteDevice,
} = require('../controllers/deviceStatusController');

// GET /api/device-status       - Get device status
router.get('/', getDeviceStatus);

// POST /api/device-status      - Update or register device status (heartbeat)
router.post('/', updateDeviceStatus);

// PUT /api/device-status/:id   - Edit device details
router.put('/:id', editDevice);

// DELETE /api/device-status/:id - Delete a device card
router.delete('/:id', deleteDevice);

module.exports = router;
