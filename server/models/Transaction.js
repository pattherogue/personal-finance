const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be either income or expense'
    }
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  // Add this to see full error messages
  validateBeforeSave: true
});

// Add middleware to log validation errors
TransactionSchema.post('save', function(error, doc, next) {
  if (error.name === 'ValidationError') {
    console.error('Validation Error:', error);
  }
  next(error);
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;