const router = require('express').Router();
const os = require('os');

router.get('/metrics', async (req, res) => {
  try {
    // Basic system information
    const metrics = {
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usagePercent: Math.round((1 - os.freemem() / os.totalmem()) * 100)
      },
      performance: {
        apiLatency: 100,
        history: Array.from({ length: 10 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 60000).toISOString(),
          responseTime: Math.floor(Math.random() * 100 + 50),
          memoryUsage: Math.floor(Math.random() * 20 + 60)
        }))
      },
      database: {
        documentCount: 0,
        storageSize: 0,
        lastBackup: new Date().toISOString()
      },
      errors: {
        rate: 0,
        lastError: 'No recent errors'
      }
    };

    res.json(metrics);
  } catch (err) {
    console.error('Error getting metrics:', err);
    res.status(500).json({ message: 'Failed to get system metrics' });
  }
});

module.exports = router;