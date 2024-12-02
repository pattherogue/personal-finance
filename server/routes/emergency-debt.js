const router = require('express').Router();
const EmergencyFund = require('../models/EmergencyFund');
const Debt = require('../models/Debt');

// Emergency Fund Routes
router.get('/emergency-fund', async (req, res) => {
  try {
    const fund = await EmergencyFund.findOne() || {
      goal: 0,
      current: 0,
      monthlyContribution: 0
    };
    res.json(fund);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/emergency-fund', async (req, res) => {
  try {
    let fund = await EmergencyFund.findOne();
    if (fund) {
      Object.assign(fund, req.body);
      fund = await fund.save();
    } else {
      fund = await EmergencyFund.create(req.body);
    }
    res.json(fund);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Debt Routes
router.get('/debts', async (req, res) => {
  try {
    const debts = await Debt.find().sort({ interestRate: -1 });
    res.json(debts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/debts', async (req, res) => {
  try {
    const debt = new Debt(req.body);
    const newDebt = await debt.save();
    res.status(201).json(newDebt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/debts/:id', async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    Object.assign(debt, req.body);
    const updatedDebt = await debt.save();
    res.json(updatedDebt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/debts/:id', async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    await debt.deleteOne();
    res.json({ message: 'Debt deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Analysis Routes
router.get('/debt-analysis', async (req, res) => {
  try {
    const debts = await Debt.find();
    const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const highestInterest = debts.reduce((max, debt) => 
      Math.max(max, debt.interestRate), 0);

    const analysis = {
      totalDebt,
      totalMinPayment,
      highestInterest,
      debtCount: debts.length,
      recommendations: generateDebtRecommendations(debts)
    };

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function for debt recommendations
function generateDebtRecommendations(debts) {
  const recommendations = [];

  // Sort debts by interest rate (Debt Avalanche method)
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);

  if (sortedDebts.length > 0) {
    recommendations.push({
      type: 'priority',
      message: `Focus on paying off ${sortedDebts[0].name} first with ${sortedDebts[0].interestRate}% interest rate`,
      priority: 'high'
    });
  }

  // Calculate total minimum payments
  const totalMin = sortedDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  if (totalMin > 0) {
    recommendations.push({
      type: 'minimum',
      message: `Ensure you can make the total minimum payment of $${totalMin.toFixed(2)} per month`,
      priority: 'high'
    });
  }

  // High interest rate warning
  const highInterestDebts = sortedDebts.filter(d => d.interestRate > 20);
  if (highInterestDebts.length > 0) {
    recommendations.push({
      type: 'warning',
      message: 'Consider consolidating your high-interest debts',
      priority: 'medium'
    });
  }

  return recommendations;
}

module.exports = router;