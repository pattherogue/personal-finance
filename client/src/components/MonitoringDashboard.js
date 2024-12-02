import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';
import {
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

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/monitor/metrics');
        setMetrics(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load system metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" m={3}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Alert severity="error" sx={{ m: 2 }}>
      {error}
    </Alert>
  );

  return (
    <Grid container spacing={3}>
      {/* System Status */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">Memory Usage</Typography>
            <LinearProgress 
              variant="determinate" 
              value={metrics?.memory?.usagePercent || 0} 
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="caption">
              {metrics?.memory?.usagePercent || 0}% used
            </Typography>
          </Box>
          <Typography variant="body2" gutterBottom>
            API Latency: {metrics?.performance?.apiLatency || 0} ms
          </Typography>
        </Paper>
      </Grid>

      {/* Performance Chart */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            System Performance
          </Typography>
          <ResponsiveContainer>
            <LineChart data={metrics?.performance?.history || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#8884d8" 
                name="Response Time (ms)" 
              />
              <Line 
                type="monotone" 
                dataKey="memoryUsage" 
                stroke="#82ca9d" 
                name="Memory Usage (%)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default MonitoringDashboard;