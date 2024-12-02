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

      // Calculate predictions for each category
      const predictions = {};
      for (const [category, amounts] of Object.entries(categorySpending)) {
        // Use simple moving average for prediction
        const average = amounts.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        predictions[category] = Math.round(average * 100) / 100;
      }

      // Generate recommendations
      const recommendations = [];
      for (const [category, predictedAmount] of Object.entries(predictions)) {
        const monthlyTotal = amounts => amounts.reduce((a, b) => a + b, 0);
        const recentMonthSpending = monthlyTotal(categorySpending[category].slice(0, 3));
        const previousMonthSpending = monthlyTotal(categorySpending[category].slice(3, 6));

        if (recentMonthSpending > previousMonthSpending * 1.1) {
          recommendations.push({
            category,
            message: `Spending in ${category} has increased by ${Math.round((recentMonthSpending/previousMonthSpending - 1) * 100)}%. Consider setting a budget of $${predictedAmount}.`,
            severity: 'warning'
          });
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