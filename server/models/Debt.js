const mongoose = require('mongoose');

const DebtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0
  },
  minimumPayment: {
    type: Number,
    required: true,
    min: 0
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Debt', DebtSchema);