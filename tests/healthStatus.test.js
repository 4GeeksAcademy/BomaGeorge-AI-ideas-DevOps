/* Basic threshold validation for computeHealthStatus logic.
   Run with: node tests/healthStatus.test.js */

function computeHealthStatus(metrics) {
  if (metrics.errorRate > 5 || metrics.latencyP95 > 2000 || metrics.uptime < 95) return 'critical';
  if (metrics.errorRate > 1 || metrics.latencyP95 > 1000 || metrics.uptime < 98) return 'warning';
  return 'healthy';
}

console.assert(computeHealthStatus({ uptime: 99.9, latencyP95: 200, errorRate: 0.5 }) === 'healthy', 'healthy case failed');
console.assert(computeHealthStatus({ uptime: 97.5, latencyP95: 1200, errorRate: 0.8 }) === 'warning', 'warning case failed');
console.assert(computeHealthStatus({ uptime: 90, latencyP95: 2500, errorRate: 6 }) === 'critical', 'critical case failed');

console.log('healthStatus tests passed');
