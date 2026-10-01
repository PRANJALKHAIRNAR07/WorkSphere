const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/dashboard', AnalyticsController.getDashboardMetrics);
router.get('/charts', AnalyticsController.getChartDatasets);
router.get('/export-csv', AnalyticsController.exportCSVReport);

module.exports = router;
