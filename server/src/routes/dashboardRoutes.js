const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/kpi', authenticateToken, dashboardController.getKPIs);

module.exports = router;
