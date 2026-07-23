const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me (Protected)
router.get('/me', authMiddleware, getMe);

module.exports = router;
