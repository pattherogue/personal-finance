const os = require('os');
const mongoose = require('mongoose');

class MonitoringService {
  static async getSystemHealth() {
    const cpuUsage = os.loadavg()[0];
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const uptime = os.uptime();

    return {
      cpu: {
        usage: cpuUsage,
        cores: os.cpus().length
      },
      memory: {
        total: totalMemory,
        free: freeMemory,
        used: totalMemory - freeMemory,
        percentUsed: ((totalMemory - freeMemory) / totalMemory * 100).toFixed(2)
      },
      uptime: {
        system: uptime,
        formatted: this.formatUptime(uptime)
      },
      timestamp: new Date().toISOString()
    };
  }

  static async getDatabaseMetrics() {
    try {
      const dbStats = await mongoose.connection.db.stats();
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      return {
        collections: collections.length,
        documents: dbStats.objects,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        avgObjSize: dbStats.avgObjSize
      };
    } catch (error) {
      console.error('Error getting database metrics:', error);
      throw error;
    }
  }

  static async getPerformanceMetrics() {
    const startTime = process.hrtime();
    const metrics = {
      apiLatency: {},
      errorRates: {},
      activeConnections: 0
    };

    // Sample API latency test
    try {
      await mongoose.connection.db.command({ ping: 1 });
      const [seconds, nanoseconds] = process.hrtime(startTime);
      metrics.apiLatency.database = seconds * 1000 + nanoseconds / 1000000;
    } catch (error) {
      metrics.errorRates.database = true;
    }

    return metrics;
  }

  static formatUptime(uptime) {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
}

module.exports = MonitoringService;