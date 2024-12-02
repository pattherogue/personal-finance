const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Validation rules
exports.validateInput = [
  // Transaction validation
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount must be positive'),
  
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  
  body('category')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category is required'),

  // User validation  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  // Validation check
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Authentication middleware
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Data validation helpers
exports.validateTransaction = (transaction) => {
  const errors = [];
  
  if (!transaction.amount || isNaN(transaction.amount)) {
    errors.push('Invalid amount');
  }
  
  if (!['income', 'expense'].includes(transaction.type)) {
    errors.push('Invalid transaction type');
  }
  
  if (!transaction.category || transaction.category.trim() === '') {
    errors.push('Category is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Monitoring middleware
exports.monitorEndpoint = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  });
  next();
};
