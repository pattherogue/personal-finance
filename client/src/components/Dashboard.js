import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from 'axios';
import FinancialInsights from './FinancialInsights'; // Import the FinancialInsights component

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const api = axios.create({
  baseURL: 'http://localhost:5001/api'
});

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0); // State to track active tab

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
      calculateSummary(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again later.');
    }
  };

  const calculateSummary = (data) => {
    const summary = data.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpenses += transaction.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpenses: 0 });

    summary.balance = summary.totalIncome - summary.totalExpenses;
    setSummary(summary);
  };

  const getExpensesByCategory = () => {
    const categories = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        categories[transaction.category] = (categories[transaction.category] || 0) + transaction.amount;
      });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Income</Typography>
              <Typography variant="h4" color="primary">
                ${summary.totalIncome.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Expenses</Typography>
              <Typography variant="h4" color="error">
                ${summary.totalExpenses.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Balance</Typography>
              <Typography variant="h4" color={summary.balance >= 0 ? "success" : "error"}>
                ${summary.balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getExpensesByCategory()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {getExpensesByCategory().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            {transactions.length === 0 ? (
              <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 2 }}>
                No transactions to display
              </Typography>
            ) : (
              transactions.map((transaction, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: 'background.default' }}>
                  <Typography variant="body1">
                    {transaction.description || transaction.category}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                  >
                    {transaction.type === 'income' ? '+' : '-'} ${transaction.amount.toFixed(2)}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* Tabs for Overview and Insights */}
        <Grid item xs={12}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" />
            <Tab label="Insights & Predictions" />
          </Tabs>
        </Grid>

        {/* Conditional rendering of tabs */}
        {activeTab === 0 ? (
          <>
            {/* Your existing Grid items for Overview */}
          </>
        ) : (
          <Grid item xs={12}>
            <FinancialInsights />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
