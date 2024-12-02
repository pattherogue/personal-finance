import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

const DataExplorer = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/data/statistics');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load statistics');
    }
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return <Typography>Loading statistics...</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Data Analysis & Insights
        </Typography>
      </Grid>

      {/* Summary Statistics */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Summary Statistics
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Total Transactions</TableCell>
                  <TableCell align="right">{stats.count}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Average Amount</TableCell>
                  <TableCell align="right">${stats.averageAmount.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Maximum Transaction</TableCell>
                  <TableCell align="right">${stats.maxAmount.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* Monthly Trends */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="subtitle1" gutterBottom>
            Monthly Trends
          </Typography>
          <ResponsiveContainer>
            <LineChart
              data={Object.entries(stats.monthlyTotals).map(([month, amount]) => ({
                month,
                amount
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Category Distribution */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="subtitle1" gutterBottom>
            Category Distribution
          </Typography>
          <ResponsiveContainer>
            <BarChart
              data={Object.entries(stats.categoryCounts).map(([category, count]) => ({
                category,
                count
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DataExplorer;