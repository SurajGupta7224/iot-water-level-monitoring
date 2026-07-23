const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const waterRoutes = require('./routes/waterRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const deviceStatusRoutes = require('./routes/deviceStatusRoutes');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/device-status', deviceStatusRoutes);

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ success: true, message: '🌊 IoT Water Level Monitoring API is running.' });
});
app.get('/api', (req, res) => {
  res.json({ success: true, message: '🌊 IoT Water Level Monitoring API is running.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found.` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
