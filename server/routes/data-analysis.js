const router = require('express').Router();
const Transaction = require('../models/Transaction');
const DataUtilsService = require('../services/dataUtilsService');
const { authenticateToken } = require('../middleware/validation');

// Get transaction statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const stats = DataUtilsService.calculateStatistics(transactions);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clean and validate transaction data
router.post('/clean', authenticateToken, async (req, res) => {
  try {
    const cleanedData = DataUtilsService.cleanTransactionData(req.body);
    res.json(cleanedData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get accuracy metrics for predictions
router.post('/accuracy', authenticateToken, async (req, res) => {
  try {
    const { predictions, actuals } = req.body;
    const accuracy = DataUtilsService.evaluateAccuracy(predictions, actuals);
    res.json(accuracy);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;