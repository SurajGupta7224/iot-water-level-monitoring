const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');

// GET /api/settings   - Get system settings
router.get('/', getSettings);

// POST /api/settings  - Update system settings
router.post('/', updateSettings);

// PUT /api/settings   - Update system settings
router.put('/', updateSettings);

module.exports = router;
