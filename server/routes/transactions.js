const router = require('express').Router();
const Transaction = require('../models/Transaction');

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    console.log('Transactions found:', transactions); // Debug log
    res.json(transactions);
  } catch (err) {
    console.error('Error in GET /transactions:', err); // Debug log
    res.status(500).json({ message: err.message });
  }
});

// Add new transaction
router.post('/', async (req, res) => {
  try {
    console.log('Received transaction data:', req.body); // Debug log
    const transaction = new Transaction({
      type: req.body.type,
      amount: req.body.amount,
      category: req.body.category,
      description: req.body.description
    });

    const newTransaction = await transaction.save();
    console.log('Saved transaction:', newTransaction); // Debug log
    res.status(201).json(newTransaction);
  } catch (err) {
    console.error('Error in POST /transactions:', err); // Debug log
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;