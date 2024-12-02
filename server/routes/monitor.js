const router = require('express').Router();
const MonitoringService = require('../services/monitoringService');
const { authenticateToken } = require('../middleware/validation');

// Get system health metrics
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const health = await MonitoringService.getSystemHealth();
    res.json(health);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get database statistics
router.get('/db-stats', authenticateToken, async (req, res) => {
  try {
    const stats = await MonitoringService.getDatabaseStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;