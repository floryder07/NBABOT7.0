class ExplanationGenerator {
  generate(pick, signals) {
    const parts = [];
    if (signals.trend) parts.push(this.explainTrend(signals.trend, pick));
    return parts.filter(p => p).join(' ');
  }

  explainTrend(trend, pick) {
    const { hitCount, windowSize, average } = trend;
    let explanation = `Hit in ${hitCount} of last ${windowSize} games.`;
    if (average > pick.line * 1.1) {
      explanation += ` Averaging ${average.toFixed(1)}, well above the line.`;
    } else if (average > pick.line) {
      explanation += ` Averaging ${average.toFixed(1)}.`;
    }
    return explanation;
  }
}

module.exports = ExplanationGenerator;
