const Transaction = require('../models/Transaction');

class AnalyticsService {
  // Analyze spending patterns and predict next month's expenses
  static async predictExpenses(userId) {
    try {
      // Get historical spending data
      const transactions = await Transaction.find({ type: 'expense' })
        .sort({ date: -1 });

      // Group transactions by category
      const categorySpending = {};
      transactions.forEach(transaction => {
        if (!categorySpending[transaction.category]) {
          categorySpending[transaction.category] = [];
        }
        categorySpending[transaction.category].push(transaction.amount);
      });

      // Calculate predictions and recommendations for each category
      const predictions = {};
      const recommendations = [];

      for (const [category, amounts] of Object.entries(categorySpending)) {
        // Use simple moving average for prediction
        const recentMonths = amounts.slice(0, 3);
        const average = recentMonths.reduce((a, b) => a + b, 0) / (recentMonths.length || 1);
        predictions[category] = Math.round(average * 100) / 100;

        // Compare with previous period spending
        const recentTotal = amounts.slice(0, 3).reduce((a, b) => a + b, 0);
        const previousTotal = amounts.slice(3, 6).reduce((a, b) => a + b, 0);

        // Only add recommendation if there's meaningful data to compare
        if (recentTotal > 0) {
          let percentageChange = 0;
          
          if (previousTotal === 0) {
            // New spending category
            recommendations.push({
              category,
              message: `New spending detected in ${category}. Consider setting a budget of $${predictions[category].toFixed(2)}.`,
              severity: 'info'
            });
          } else {
            // Calculate percentage change
            percentageChange = ((recentTotal - previousTotal) / previousTotal) * 100;
            
            if (percentageChange > 10) { // Only show warning if increase is more than 10%
              recommendations.push({
                category,
                message: `Spending in ${category} has increased by ${percentageChange.toFixed(1)}%. Consider setting a budget of $${predictions[category].toFixed(2)}.`,
                severity: 'warning'
              });
            }
          }
        }
      }

      return {
        predictions,
        recommendations
      };
    } catch (error) {
      console.error('Error in predictExpenses:', error);
      throw error;
    }
  }

  // Analyze cash flow trends
  static async analyzeCashFlow() {
    try {
      const transactions = await Transaction.find()
        .sort({ date: 1 });

      // Group by month
      const monthlyFlow = {};
      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        if (!monthlyFlow[monthYear]) {
          monthlyFlow[monthYear] = { income: 0, expenses: 0 };
        }

        if (transaction.type === 'income') {
          monthlyFlow[monthYear].income += transaction.amount;
        } else {
          monthlyFlow[monthYear].expenses += transaction.amount;
        }
      });

      // Calculate trends
      const months = Object.keys(monthlyFlow);
      const trends = months.map(month => ({
        month,
        ...monthlyFlow[month],
        netFlow: monthlyFlow[month].income - monthlyFlow[month].expenses,
        savingsRate: ((monthlyFlow[month].income - monthlyFlow[month].expenses) / monthlyFlow[month].income * 100).toFixed(1)
      }));

      return trends;
    } catch (error) {
      console.error('Error in analyzeCashFlow:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsService;
