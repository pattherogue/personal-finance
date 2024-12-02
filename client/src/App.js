import React from 'react';
import { Container, CssBaseline, Box, Typography, Paper } from '@mui/material';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';

function App() {
  const handleTransactionAdded = () => {
    // We'll implement this to refresh the dashboard
    window.location.reload();
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Personal Finance Manager
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Dashboard />
          </Box>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Add New Transaction
            </Typography>
            <TransactionForm onTransactionAdded={handleTransactionAdded} />
          </Paper>
        </Box>
      </Container>
    </>
  );
}

export default App;