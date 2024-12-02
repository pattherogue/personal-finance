const router = require('express').Router();
const AnalyticsService = require('../services/analyticsService');

router.get('/predictions', async (req, res) => {
  try {
    const predictions = await AnalyticsService.predictExpenses();
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/cashflow', async (req, res) => {
  try {
    const cashFlow = await AnalyticsService.analyzeCashFlow();
    res.json(cashFlow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;