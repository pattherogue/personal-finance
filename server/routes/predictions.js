const router = require('express').Router();
const MLService = require('../services/mlService');

router.get('/expenses', async (req, res) => {
  try {
    const predictions = await MLService.predictFutureExpenses();
    res.json(predictions);
  } catch (err) {
    console.error('Error getting predictions:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/anomalies', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    const anomalies = MLService.detectAnomalies(transactions);
    res.json(anomalies);
  } catch (err) {
    console.error('Error detecting anomalies:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;