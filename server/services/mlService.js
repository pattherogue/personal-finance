const Transaction = require('../models/Transaction');

class MLService {
  // Enhanced prediction algorithm using weighted moving average and trend analysis
  static async predictFutureExpenses(userId) {
    try {
      const transactions = await Transaction.find({ type: 'expense' })
        .sort({ date: -1 });

      const predictions = {};
      const accuracy = {};

      // Group by category
      const categoryGroups = this.groupByCategory(transactions);

      for (const [category, catTransactions] of Object.entries(categoryGroups)) {
        const monthlyTotals = this.getMonthlyTotals(catTransactions);
        const recentMonths = this.getRecentMonths(monthlyTotals, 6); // Last 6 months

        // Calculate trend
        const trend = this.calculateTrend(recentMonths);
        
        // Calculate seasonal factors
        const seasonality = this.calculateSeasonality(monthlyTotals);

        // Calculate weighted average (more recent months have higher weight)
        const weights = [0.3, 0.25, 0.2, 0.15, 0.07, 0.03]; // Weights sum to 1
        const weightedAvg = this.calculateWeightedAverage(recentMonths, weights);

        // Make prediction incorporating trend and seasonality
        const baselinePrediction = weightedAvg * (1 + trend);
        const seasonalFactor = seasonality[new Date().getMonth()] || 1;
        const finalPrediction = baselinePrediction * seasonalFactor;

        // Calculate accuracy metrics
        const accuracyMetrics = this.calculateAccuracyMetrics(
          catTransactions,
          recentMonths,
          finalPrediction
        );

        predictions[category] = {
          amount: Math.round(finalPrediction * 100) / 100,
          trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
          confidence: accuracyMetrics.confidence,
          seasonalFactor
        };

        accuracy[category] = accuracyMetrics;
      }

      return { predictions, accuracy };
    } catch (error) {
      console.error('Error in predictFutureExpenses:', error);
      throw error;
    }
  }

  // Helper methods
  static groupByCategory(transactions) {
    return transactions.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    }, {});
  }

  static getMonthlyTotals(transactions) {
    const monthly = {};
    transactions.forEach(t => {
      const monthKey = new Date(t.date).toISOString().slice(0, 7);
      monthly[monthKey] = (monthly[monthKey] || 0) + t.amount;
    });
    return monthly;
  }

  static getRecentMonths(monthlyTotals, count) {
    return Object.entries(monthlyTotals)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, count)
      .map(([_, amount]) => amount);
  }

  static calculateTrend(recentMonths) {
    if (recentMonths.length < 2) return 0;
    
    const xMean = (recentMonths.length - 1) / 2;
    const yMean = recentMonths.reduce((a, b) => a + b, 0) / recentMonths.length;
    
    let numerator = 0;
    let denominator = 0;
    
    recentMonths.forEach((y, x) => {
      numerator += (x - xMean) * (y - yMean);
      denominator += Math.pow(x - xMean, 2);
    });
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  static calculateSeasonality(monthlyTotals) {
    const seasonalFactors = {};
    const monthlyAverages = {};
    
    // Calculate average for each month
    Object.entries(monthlyTotals).forEach(([monthKey, amount]) => {
      const month = new Date(monthKey).getMonth();
      if (!monthlyAverages[month]) {
        monthlyAverages[month] = { sum: 0, count: 0 };
      }
      monthlyAverages[month].sum += amount;
      monthlyAverages[month].count++;
    });

    // Calculate overall average
    let overallAverage = 0;
    let totalCount = 0;
    Object.values(monthlyAverages).forEach(({ sum, count }) => {
      overallAverage += sum;
      totalCount += count;
    });
    overallAverage /= totalCount;

    // Calculate seasonal factors
    Object.entries(monthlyAverages).forEach(([month, { sum, count }]) => {
      const monthlyAverage = sum / count;
      seasonalFactors[month] = monthlyAverage / overallAverage;
    });

    return seasonalFactors;
  }

  static calculateWeightedAverage(values, weights) {
    return values.reduce((acc, value, i) => 
      acc + value * (weights[i] || 0), 0);
  }

  static calculateAccuracyMetrics(transactions, recentMonths, prediction) {
    if (recentMonths.length === 0) {
      return { mape: 0, rmse: 0, confidence: 0 };
    }

    // Calculate Mean Absolute Percentage Error (MAPE)
    const mape = recentMonths.reduce((acc, actual, i) => {
      if (actual === 0) return acc;
      const previous = recentMonths[i + 1] || prediction;
      return acc + Math.abs((actual - previous) / actual);
    }, 0) / recentMonths.length;

    // Calculate Root Mean Square Error (RMSE)
    const rmse = Math.sqrt(
      recentMonths.reduce((acc, actual, i) => {
        const previous = recentMonths[i + 1] || prediction;
        return acc + Math.pow(actual - previous, 2);
      }, 0) / recentMonths.length
    );

    // Calculate confidence score (0-100)
    const confidence = Math.max(0, Math.min(100, 100 * (1 - mape)));

    return {
      mape: Math.round(mape * 100) / 100,
      rmse: Math.round(rmse * 100) / 100,
      confidence: Math.round(confidence)
    };
  }

  // Anomaly detection
  static detectAnomalies(transactions) {
    const anomalies = [];
    const categoryGroups = this.groupByCategory(transactions);

    for (const [category, catTransactions] of Object.entries(categoryGroups)) {
      const amounts = catTransactions.map(t => t.amount);
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = Math.sqrt(
        amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / amounts.length
      );

      catTransactions.forEach(transaction => {
        const zScore = (transaction.amount - mean) / stdDev;
        if (Math.abs(zScore) > 2) {
          anomalies.push({
            transaction,
            category,
            zScore: Math.round(zScore * 100) / 100,
            expectedAmount: Math.round(mean * 100) / 100,
            deviation: Math.round((transaction.amount - mean) * 100) / 100
          });
        }
      });
    }

    return anomalies;
  }
}

module.exports = MLService;