import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert
} from '@mui/material';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api'
});

const BudgetForm = ({ onBudgetAdded }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Food',
    'Transportation',
    'Housing',
    'Entertainment',
    'Utilities',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/budgets', formData);
      setSuccess('Budget set successfully!');
      setFormData({
        category: '',
        amount: '',
        period: 'monthly'
      });
      if (onBudgetAdded) onBudgetAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Error setting budget');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleChange}
              required
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Budget Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            inputProps={{ min: "0", step: "0.01" }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Period</InputLabel>
            <Select
              name="period"
              value={formData.period}
              label="Period"
              onChange={handleChange}
              required
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
          >
            Set Budget
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BudgetForm;