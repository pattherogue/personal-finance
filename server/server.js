require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { monitorEndpoint } = require('./middleware/validation'); // Assuming this is your custom middleware

const app = express();

// Debug .env loading
console.log('Environment variables loaded:', {
  mongoUriExists: !!process.env.MONGO_URI,
  envPath: path.resolve(process.cwd(), '.env')
});

// Security middleware
app.use(helmet()); // Adds security headers
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Monitoring endpoint (if applicable)
app.use(monitorEndpoint);

// Body parsing middleware
app.use(express.json());

// MongoDB Connection with error handling
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets')); // Keep your budget route
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/data', require('./routes/data-analysis'));
app.use('/api/monitor', require('./routes/monitor'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
