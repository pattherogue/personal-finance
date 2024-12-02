const mongoose = require('mongoose');

const EmergencyFundSchema = new mongoose.Schema({
  goal: {
    type: Number,
    required: true,
    min: 0
  },
  current: {
    type: Number,
    required: true,
    min: 0
  },
  monthlyContribution: {
    type: Number,
    required: true,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmergencyFund', EmergencyFundSchema);