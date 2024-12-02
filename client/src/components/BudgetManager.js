import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import BudgetForm from './BudgetForm';
import BudgetDisplay from './BudgetDisplay';

const BudgetManager = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleBudgetUpdate = () => {
    // Force a re-render of BudgetDisplay
    setValue(prev => prev);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Current Budgets" />
          <Tab label="Set New Budget" />
        </Tabs>
      </Box>
      
      {value === 0 && (
        <BudgetDisplay onBudgetUpdate={handleBudgetUpdate} />
      )}
      {value === 1 && (
        <BudgetForm onBudgetAdded={() => {
          setValue(0);
          handleBudgetUpdate();
        }} />
      )}
    </Box>
  );
};

export default BudgetManager;