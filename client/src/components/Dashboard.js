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
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button
} from '@mui/material';
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush
} from 'recharts';
import axios from 'axios';
import MonitoringDashboard from './MonitoringDashboard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const api = axios.create({
  baseURL: 'http://localhost:5001/api'
});

const Dashboard = () => {
  // State
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [timeframe, setTimeframe] = useState('monthly');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateRange, setDateRange] = useState([0, 100]);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
      calculateSummary(response.data);
      
      // Initialize selected categories
      const categories = [...new Set(response.data.map(t => t.category))];
      setSelectedCategories(categories);
      
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
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

  const getMonthlyData = () => {
    const monthlyData = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthYear].income += transaction.amount;
      } else {
        monthlyData[monthYear].expenses += transaction.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));
  };

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleRangeChange = (event, newValue) => {
    setDateRange(newValue);
  };

  const renderOverviewTab = () => (
    <>
      {/* Expense Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Expenses by Category
          </Typography>
          <ResponsiveContainer>
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
    </>
  );

  const renderAnalyticsTab = () => (
    <>
      {/* Controls */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Timeframe</InputLabel>
                <Select value={timeframe} onChange={handleTimeframeChange}>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography gutterBottom>Date Range</Typography>
              <Slider
                value={dateRange}
                onChange={handleRangeChange}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Monthly Trends */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Monthly Income vs Expenses
          </Typography>
          <ResponsiveContainer>
            <LineChart data={getMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#82ca9d" name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#8884d8" name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Category Trends */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Category Spending Trends
          </Typography>
          <ResponsiveContainer>
            <BarChart data={getExpensesByCategory()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </>
  );

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

        {/* Tabs */}
        <Grid item xs={12}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" />
            <Tab label="Analytics & Insights" />
            <Tab label="System Monitor" />
          </Tabs>
        </Grid>

        {/* Tab Content */}
        {activeTab === 0 ? renderOverviewTab() : 
         activeTab === 1 ? renderAnalyticsTab() :
         <MonitoringDashboard />}
      </Grid>
    </Box>
  );
};

export default Dashboard;