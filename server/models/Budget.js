const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    required: true
  },
  currentSpent: {
    type: Number,
    default: 0
  },
  period: {
    type: String,
    enum: ['monthly', 'weekly'],
    default: 'monthly'
  }
});

module.exports = mongoose.model('Budget', BudgetSchema);
