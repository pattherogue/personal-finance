const router = require('express').Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Get all budgets with spending data
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find();
    
    // Calculate current spending for each budget
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    for (let budget of budgets) {
      const spending = await Transaction.aggregate([
        {
          $match: {
            type: 'expense',
            category: budget.category,
            date: { $gte: firstDayOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      budget.currentSpent = spending[0]?.total || 0;
      await budget.save();
    }

    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new budget
router.post('/', async (req, res) => {
  try {
    const budget = new Budget({
      category: req.body.category,
      amount: req.body.amount,
      period: req.body.period || 'monthly'
    });

    const newBudget = await budget.save();
    res.status(201).json(newBudget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update budget
router.put('/:id', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    budget.amount = req.body.amount || budget.amount;
    budget.period = req.body.period || budget.period;
    
    const updatedBudget = await budget.save();
    res.json(updatedBudget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete budget
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await budget.deleteOne();
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;