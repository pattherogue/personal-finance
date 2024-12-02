const router = require('express').Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const BudgetService = require('../services/budgetService');

// Get all budgets with spending data and analysis
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

    // Analyze spending and savings using BudgetService
    const analysis = BudgetService.analyzeSpendingAndSavings(budgets);

    res.json({
      budgets,
      analysis
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new budget
router.post('/', async (req, res) => {
  try {
    const budget = new Budget(req.body);
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

    Object.assign(budget, req.body);
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
