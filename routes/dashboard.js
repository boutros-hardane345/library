const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/', protect, dashboardController.getDashboard);

module.exports = router;
