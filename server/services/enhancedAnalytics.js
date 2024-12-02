class EnhancedAnalytics {
    // Advanced data wrangling
    static cleanAndValidateData(transactions) {
      return transactions.map(transaction => {
        // Clean amount
        const amount = parseFloat(transaction.amount);
        if (isNaN(amount) || amount < 0) {
          throw new Error(`Invalid amount for transaction: ${transaction._id}`);
        }
  
        // Standardize categories
        const categoryMap = {
          'groceries': 'Food',
          'dining': 'Food',
          'restaurant': 'Food',
          'transport': 'Transportation',
          'gas': 'Transportation',
          'uber': 'Transportation',
          'rent': 'Housing',
          'mortgage': 'Housing',
          'utilities': 'Utilities',
          'entertainment': 'Entertainment'
        };
  
        const normalizedCategory = categoryMap[transaction.category.toLowerCase()] || transaction.category;
  
        // Validate and format date
        const date = new Date(transaction.date);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date for transaction: ${transaction._id}`);
        }
  
        return {
          ...transaction,
          amount,
          category: normalizedCategory,
          date
        };
      });
    }
  
    // Advanced trend analysis
    static analyzeSpendingTrends(transactions) {
      const trends = {
        monthly: {},
        weekly: {},
        daily: {},
        categoryTrends: {},
        anomalies: []
      };
  
      transactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const weekKey = this.getWeekNumber(date);
        const dayKey = date.toISOString().split('T')[0];
  
        // Monthly aggregation
        if (!trends.monthly[monthKey]) trends.monthly[monthKey] = { total: 0, count: 0, byCategory: {} };
        trends.monthly[monthKey].total += t.amount;
        trends.monthly[monthKey].count++;
        
        // Category trends
        if (!trends.monthly[monthKey].byCategory[t.category]) {
          trends.monthly[monthKey].byCategory[t.category] = 0;
        }
        trends.monthly[monthKey].byCategory[t.category] += t.amount;
  
        // Detect anomalies (spending > 2x average)
        const avgForCategory = this.calculateAverage(trends.monthly[monthKey].byCategory[t.category], trends.monthly[monthKey].count);
        if (t.amount > avgForCategory * 2) {
          trends.anomalies.push({
            date: t.date,
            category: t.category,
            amount: t.amount,
            averageAmount: avgForCategory,
            difference: t.amount - avgForCategory
          });
        }
      });
  
      // Calculate month-over-month changes
      trends.monthlyChanges = this.calculateMonthlyChanges(trends.monthly);
  
      return trends;
    }
  
    // Predictive analysis using moving averages and weighted recent data
    static predictFutureSpending(transactions) {
      const predictions = {
        nextMonth: {},
        confidence: {},
        trends: {}
      };
  
      // Group by category
      const byCategory = {};
      transactions.forEach(t => {
        if (!byCategory[t.category]) byCategory[t.category] = [];
        byCategory[t.category].push(t);
      });
  
      // Calculate predictions for each category
      Object.entries(byCategory).forEach(([category, transactions]) => {
        const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentMonths = sortedTransactions.slice(0, 3);
        const olderMonths = sortedTransactions.slice(3, 6);
  
        // Weighted average (recent months count more)
        const recentAvg = this.calculateWeightedAverage(recentMonths.map(t => t.amount), [0.5, 0.3, 0.2]);
        const olderAvg = this.calculateWeightedAverage(olderMonths.map(t => t.amount), [0.4, 0.3, 0.3]);
  
        // Predict next month
        predictions.nextMonth[category] = recentAvg * 0.7 + olderAvg * 0.3;
  
        // Calculate trend
        const trend = ((recentAvg - olderAvg) / olderAvg) * 100;
        predictions.trends[category] = trend;
  
        // Calculate confidence based on consistency
        const variance = this.calculateVariance(transactions.map(t => t.amount));
        predictions.confidence[category] = Math.max(0, 100 - (variance * 10));
      });
  
      return predictions;
    }
  
    // Helper functions
    static calculateWeightedAverage(values, weights) {
      return values.reduce((acc, val, i) => acc + (val * (weights[i] || 0)), 0);
    }
  
    static calculateVariance(values) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length);
    }
  
    static getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
  
    static calculateAverage(total, count) {
      return count > 0 ? total / count : 0;
    }
  
    static calculateMonthlyChanges(monthlyData) {
      const changes = {};
      const months = Object.keys(monthlyData).sort();
      
      for (let i = 1; i < months.length; i++) {
        const currentMonth = months[i];
        const previousMonth = months[i - 1];
        
        changes[currentMonth] = {
          total: ((monthlyData[currentMonth].total - monthlyData[previousMonth].total) / monthlyData[previousMonth].total) * 100,
          byCategory: {}
        };
        
        // Calculate category changes
        Object.keys(monthlyData[currentMonth].byCategory).forEach(category => {
          const current = monthlyData[currentMonth].byCategory[category] || 0;
          const previous = monthlyData[previousMonth].byCategory[category] || 0;
          
          changes[currentMonth].byCategory[category] = previous === 0 ? 100 : ((current - previous) / previous) * 100;
        });
      }
      
      return changes;
    }
  }
  
  module.exports = EnhancedAnalytics;