const mongoose = require('mongoose');

class MonitoringService {
  // Get database stats
  static async getDatabaseStats() {
    try {
      const stats = await mongoose.connection.db.stats();
      return {
        collections: stats.collections,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  // Get system health information
  static async getSystemHealth() {
    const memoryUsage = process.memoryUsage();
    return {
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024)
      },
      timestamp: new Date().toISOString()
    };
  }

  // Validate accuracy of predictions vs actual data
  static validateDataAccuracy(predictions, actuals) {
    const errors = predictions.map((pred, i) => Math.abs(pred - actuals[i]));
    return {
      meanError: errors.reduce((a, b) => a + b, 0) / errors.length,
      maxError: Math.max(...errors),
      minError: Math.min(...errors),
      accuracy: 1 - (errors.reduce((a, b) => a + b, 0) / actuals.reduce((a, b) => a + b, 0))
    };
  }
}

module.exports = MonitoringService;
