import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  LinearProgress,
  Card,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api'
});

const EmergencyFundDebt = () => {
  const [emergencyFund, setEmergencyFund] = useState({
    goal: 0,
    current: 0,
    monthlyContribution: 0
  });
  
  const [debts, setDebts] = useState([]);
  const [newDebt, setNewDebt] = useState({
    name: '',
    amount: '',
    interestRate: '',
    minimumPayment: '',
    priority: 'high'
  });

  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fundRes, debtsRes] = await Promise.all([
        api.get('/emergency-fund'),
        api.get('/debts')
      ]);
      setEmergencyFund(fundRes.data);
      setDebts(debtsRes.data);
      generateRecommendations(fundRes.data, debtsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const generateRecommendations = (fund, debts) => {
    const recs = [];
    
    // Emergency Fund recommendations
    const monthsToGoal = fund.goal === 0 ? 0 : 
      Math.ceil((fund.goal - fund.current) / fund.monthlyContribution);
    
    if (fund.current < fund.goal) {
      recs.push({
        type: 'emergency',
        message: `Continue monthly contributions of $${fund.monthlyContribution} to reach your goal in ${monthsToGoal} months.`
      });
    }

    // Debt recommendations using Debt Avalanche method
    const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
    if (sortedDebts.length > 0) {
      recs.push({
        type: 'debt',
        message: `Focus on paying off ${sortedDebts[0].name} first due to its high interest rate of ${sortedDebts[0].interestRate}%.`
      });
    }

    setRecommendations(recs);
  };

  const handleEmergencyFundUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/emergency-fund', emergencyFund);
      setEmergencyFund(response.data);
      generateRecommendations(response.data, debts);
    } catch (error) {
      console.error('Error updating emergency fund:', error);
    }
  };

  const handleDebtSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/debts', newDebt);
      setDebts([...debts, response.data]);
      setNewDebt({
        name: '',
        amount: '',
        interestRate: '',
        minimumPayment: '',
        priority: 'high'
      });
      generateRecommendations(emergencyFund, [...debts, response.data]);
    } catch (error) {
      console.error('Error adding debt:', error);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Emergency Fund Section */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Emergency Fund
          </Typography>
          <Box component="form" onSubmit={handleEmergencyFundUpdate}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Goal Amount"
                  type="number"
                  value={emergencyFund.goal}
                  onChange={(e) => setEmergencyFund({
                    ...emergencyFund,
                    goal: parseFloat(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Amount"
                  type="number"
                  value={emergencyFund.current}
                  onChange={(e) => setEmergencyFund({
                    ...emergencyFund,
                    current: parseFloat(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Monthly Contribution"
                  type="number"
                  value={emergencyFund.monthlyContribution}
                  onChange={(e) => setEmergencyFund({
                    ...emergencyFund,
                    monthlyContribution: parseFloat(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Update Emergency Fund
                </Button>
              </Grid>
              <Grid item xs={12}>
                <LinearProgress
                  variant="determinate"
                  value={(emergencyFund.current / emergencyFund.goal) * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="caption">
                  {((emergencyFund.current / emergencyFund.goal) * 100).toFixed(1)}% of goal
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>

      {/* Debt Management Section */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Debt Management
          </Typography>
          <Box component="form" onSubmit={handleDebtSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Debt Name"
                  value={newDebt.name}
                  onChange={(e) => setNewDebt({
                    ...newDebt,
                    name: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={newDebt.amount}
                  onChange={(e) => setNewDebt({
                    ...newDebt,
                    amount: parseFloat(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Interest Rate (%)"
                  type="number"
                  value={newDebt.interestRate}
                  onChange={(e) => setNewDebt({
                    ...newDebt,
                    interestRate: parseFloat(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Minimum Payment"
                  type="number"
                  value={newDebt.minimumPayment}
                  onChange={(e) => setNewDebt({
                    ...newDebt,
                    minimumPayment: parseFloat(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newDebt.priority}
                    onChange={(e) => setNewDebt({
                      ...newDebt,
                      priority: e.target.value
                    })}
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Add Debt
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>

      {/* Recommendations */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recommendations
          </Typography>
          {recommendations.map((rec, index) => (
            <Alert
              key={index}
              severity={rec.type === 'emergency' ? 'info' : 'warning'}
              sx={{ mb: 1 }}
            >
              {rec.message}
            </Alert>
          ))}
        </Paper>
      </Grid>

      {/* Debt List */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Current Debts
          </Typography>
          <Grid container spacing={2}>
            {debts.map((debt, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{debt.name}</Typography>
                    <Typography>Amount: ${debt.amount}</Typography>
                    <Typography>Interest Rate: {debt.interestRate}%</Typography>
                    <Typography>Minimum Payment: ${debt.minimumPayment}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={0}
                      sx={{ mt: 1, height: 5, borderRadius: 5 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default EmergencyFundDebt;