import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api'
});

const FinancialInsights = () => {
  const [predictions, setPredictions] = useState(null);
  const [cashFlow, setCashFlow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const [predictionsRes, cashFlowRes] = await Promise.all([
        api.get('/analytics/predictions'),
        api.get('/analytics/cashflow')
      ]);

      setPredictions(predictionsRes.data);
      setCashFlow(cashFlowRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load insights');
      setLoading(false);
    }
  };

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={3}>
      {/* Predictions and Recommendations */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Financial Insights & Recommendations
          </Typography>
          {predictions?.recommendations.map((rec, index) => (
            <Alert severity={rec.severity} sx={{ mb: 1 }} key={index}>
              {rec.message}
            </Alert>
          ))}
        </Paper>
      </Grid>

      {/* Cash Flow Trends */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Monthly Cash Flow Trends
          </Typography>
          <ResponsiveContainer>
            <LineChart data={cashFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#82ca9d"
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#8884d8"
                name="Expenses"
              />
              <Line
                type="monotone"
                dataKey="netFlow"
                stroke="#ffc658"
                name="Net Flow"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Category Predictions */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Predicted Monthly Expenses by Category
          </Typography>
          <ResponsiveContainer>
            <BarChart
              data={Object.entries(predictions?.predictions || {}).map(([category, amount]) => ({
                category,
                amount
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="amount" fill="#8884d8" name="Predicted Amount" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default FinancialInsights;