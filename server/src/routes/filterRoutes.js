const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filterController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/categories', authenticateToken, filterController.getCategories);
router.get('/locations', authenticateToken, filterController.getLocations);
router.get('/statuses', authenticateToken, filterController.getStatuses);

module.exports = router;
