const { CONFIDENCE } = require('../../config/constants');

class TrendAnalyzer {
  analyzePlayerTrend(player, market, threshold, window = 'last_10') {
    const windowSize = this.getWindowSize(window);
    const hitCount = player.getTrendCount(market, threshold, windowSize);
    const average = player.getAverageStat(market, windowSize);
    const variance = player.getVariance(market, windowSize);
    const color = this.determineColor(hitCount, window);
    const confidence = this.calculateConfidence(hitCount, windowSize, variance, average, threshold);

    return { hitCount, windowSize, average, variance, color, confidence, hitRate: hitCount / windowSize };
  }

  determineColor(hitCount, window) {
    const thresholds = CONFIDENCE[window.toUpperCase()] || CONFIDENCE.LAST_10;
    if (hitCount >= thresholds.GREEN_MIN) return 'green';
    if (hitCount >= thresholds.ORANGE_MIN) return 'orange';
    return 'red';
  }

  calculateConfidence(hitCount, windowSize, variance, average, threshold) {
    let score = (hitCount / windowSize) * 100;
    const normalizedVariance = Math.min(variance / average, 1);
    score -= normalizedVariance * 20;
    const cushion = ((average - threshold) / threshold) * 100;
    if (cushion > 15) score += 5;
    else if (cushion < -5) score -= 10;
    return Math.max(0, Math.min(100, score));
  }

  getWindowSize(window) {
    const sizes = { last_5: 5, last_10: 10, last_15: 15 };
    return sizes[window] || 10;
  }
}

module.exports = TrendAnalyzer;
