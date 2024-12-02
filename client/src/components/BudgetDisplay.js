import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api'
});

const BudgetDisplay = ({ onBudgetUpdate }) => {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await api.get('/budgets');
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
      if (onBudgetUpdate) onBudgetUpdate();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const calculateProgress = (spent, budget) => {
    return (spent / budget) * 100;
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'error';
    if (progress >= 70) return 'warning';
    return 'primary';
  };

  return (
    <Grid container spacing={2}>
      {budgets.map((budget) => (
        <Grid item xs={12} key={budget._id}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                {budget.category} Budget
              </Typography>
              <Box>
                <IconButton size="small" onClick={() => handleDelete(budget._id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget: ${budget.amount}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ flexGrow: 1, mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(calculateProgress(budget.currentSpent, budget.amount), 100)}
                  color={getProgressColor(calculateProgress(budget.currentSpent, budget.amount))}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                ${budget.currentSpent} / ${budget.amount}
              </Typography>
            </Box>
            
            {budget.currentSpent > budget.amount && (
              <Typography color="error" variant="body2">
                Over budget by ${(budget.currentSpent - budget.amount).toFixed(2)}
              </Typography>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default BudgetDisplay;