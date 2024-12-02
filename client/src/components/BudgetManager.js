import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api'
});

const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    savingsGoal: '',
    debtRepayment: {
      priority: 'medium',
      minimumPayment: ''
    }
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await api.get('/budgets');
      setBudgets(response.data.budgets);
      setAnalysis(response.data.analysis);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets', formData);
      fetchBudgets();
      setFormData({
        category: '',
        amount: '',
        period: 'monthly',
        savingsGoal: '',
        debtRepayment: {
          priority: 'medium',
          minimumPayment: ''
        }
      });
    } catch (err) {
      console.error('Error creating budget:', err);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Budget Form */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Set Budget
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Savings Goal"
                  value={formData.savingsGoal}
                  onChange={(e) => setFormData({ ...formData, savingsGoal: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Debt Priority</InputLabel>
                  <Select
                    value={formData.debtRepayment.priority}
                    onChange={(e) => setFormData({
                      ...formData,
                      debtRepayment: { ...formData.debtRepayment, priority: e.target.value }
                    })}
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Set Budget
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>

      {/* Recommendations */}
      {analysis?.recommendations.map((rec, index) => (
        <Grid item xs={12} key={index}>
          <Alert severity={rec.type === 'warning' ? 'warning' : 'info'}>
            {rec.message}
            {rec.action && <Typography variant="body2">{rec.action}</Typography>}
          </Alert>
        </Grid>
      ))}

      {/* Budget Status */}
      {budgets.map((budget) => (
        <Grid item xs={12} md={6} key={budget._id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {budget.category}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Budget: ${budget.amount}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(analysis?.budgetStatus[budget.category]?.percentageUsed || 0)}
                  color={
                    (analysis?.budgetStatus[budget.category]?.percentageUsed || 0) > 100
                      ? 'error'
                      : 'primary'
                  }
                />
                <Typography variant="caption">
                  {analysis?.budgetStatus[budget.category]?.percentageUsed.toFixed(1)}% used
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Debt Repayment Plan */}
      {analysis?.debtRepaymentPlan.length > 0 && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Debt Repayment Plan
            </Typography>
            <Grid container spacing={2}>
              {analysis.debtRepaymentPlan.map((debt, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">{debt.category}</Typography>
                      <Typography>Minimum: ${debt.minimumPayment}</Typography>
                      {debt.additionalPayment > 0 && (
                        <Typography color="success.main">
                          Extra Payment: ${debt.additionalPayment}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};

export default BudgetManager;