class DataUtilsService {
    // Data cleaning functions
    static cleanTransactionData(transaction) {
      return {
        ...transaction,
        amount: this.cleanAmount(transaction.amount),
        category: this.cleanCategory(transaction.category),
        description: this.cleanDescription(transaction.description),
        date: this.validateDate(transaction.date)
      };
    }
  
    static cleanAmount(amount) {
      // Convert to number and fix to 2 decimal places
      const cleanedAmount = parseFloat(amount);
      if (isNaN(cleanedAmount)) {
        throw new Error('Invalid amount value');
      }
      return Math.round(cleanedAmount * 100) / 100;
    }
  
    static cleanCategory(category) {
      // Standardize categories
      const standardCategories = {
        'food': 'Food',
        'foods': 'Food',
        'grocery': 'Food',
        'groceries': 'Food',
        'transport': 'Transportation',
        'transportation': 'Transportation',
        'travel': 'Transportation',
        'house': 'Housing',
        'housing': 'Housing',
        'rent': 'Housing',
        'mortgage': 'Housing',
        'entertainment': 'Entertainment',
        'fun': 'Entertainment',
        'utility': 'Utilities',
        'utilities': 'Utilities',
        'bills': 'Utilities'
      };
  
      const lowercaseCategory = category.toLowerCase().trim();
      return standardCategories[lowercaseCategory] || category;
    }
  
    static cleanDescription(description) {
      return description ? description.trim() : '';
    }
  
    static validateDate(date) {
      const parsedDate = new Date(date);
      return isNaN(parsedDate) ? new Date() : parsedDate;
    }
  
    // Data analysis functions
    static calculateStatistics(transactions) {
      const stats = {
        count: transactions.length,
        totalAmount: 0,
        averageAmount: 0,
        maxAmount: 0,
        minAmount: Infinity,
        categoryCounts: {},
        monthlyTotals: {},
        dayOfWeekTotals: {}
      };
  
      transactions.forEach(t => {
        const amount = parseFloat(t.amount);
        stats.totalAmount += amount;
        stats.maxAmount = Math.max(stats.maxAmount, amount);
        stats.minAmount = Math.min(stats.minAmount, amount);
        
        // Category distribution
        stats.categoryCounts[t.category] = (stats.categoryCounts[t.category] || 0) + 1;
        
        // Monthly patterns
        const monthYear = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        stats.monthlyTotals[monthYear] = (stats.monthlyTotals[monthYear] || 0) + amount;
        
        // Day of week patterns
        const dayOfWeek = new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' });
        stats.dayOfWeekTotals[dayOfWeek] = (stats.dayOfWeekTotals[dayOfWeek] || 0) + amount;
      });
  
      stats.averageAmount = stats.totalAmount / stats.count;
      return stats;
    }
  
    // Accuracy evaluation
    static evaluateAccuracy(predictions, actuals) {
      const errors = [];
      let totalError = 0;
      let totalActual = 0;
  
      for (let i = 0; i < predictions.length; i++) {
        const error = Math.abs(predictions[i] - actuals[i]);
        errors.push(error);
        totalError += error;
        totalActual += actuals[i];
      }
  
      return {
        meanAbsoluteError: totalError / predictions.length,
        meanAbsolutePercentageError: (totalError / totalActual) * 100,
        maxError: Math.max(...errors),
        minError: Math.min(...errors),
        accuracy: 100 - ((totalError / totalActual) * 100)
      };
    }
  }
  
  module.exports = DataUtilsService;