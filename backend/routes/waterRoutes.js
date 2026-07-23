const express = require('express');
const router = express.Router();
const {
  getAllReadings,
  getLatestReading,
  getReadingById,
  addReading,
  deleteReading,
} = require('../controllers/waterController');

// GET /api/water          - Get all readings
router.get('/', getAllReadings);

// GET /api/water/latest   - Get latest reading
router.get('/latest', getLatestReading);

// GET /api/water/:id      - Get reading by ID
router.get('/:id', getReadingById);

// POST /api/water         - Add new reading (from IoT sensor)
router.post('/', addReading);

// DELETE /api/water/:id   - Delete a reading
router.delete('/:id', deleteReading);

module.exports = router;
