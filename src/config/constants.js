module.exports = {
  CONFIDENCE: {
    LAST_5: { GREEN_MIN: 4, ORANGE_MIN: 2 },
    LAST_10: { GREEN_MIN: 7, ORANGE_MIN: 4 },
    LAST_15: { GREEN_MIN: 11, ORANGE_MIN: 6 }
  },
  MODES: {
    SAFE: 'safe',
    NORMAL: 'normal',
    MOONSHOT: 'moonshot'
  },
  COLORS: {
    GREEN: '🟢',
    ORANGE: '🟠',
    RED: '🔴',
    MOONSHOT: '🚀'
  },
  COOLDOWN_DURATION: parseInt(process.env.COOLDOWN_DURATION) || 60,
  MAX_ODDS: -200,

  // Mode criteria are configurable thresholds used by the CLI
  MODE_CRITERIA: {
    safe: { minConfidence: 65, requiredColor: 'green' },
    normal: { minConfidence: 50, requiredColors: ['green', 'orange'] },
    moonshot: { minConfidence: 35 }
  },

  // Risk configuration used by calculateRisk
  RISK_CONFIG: {
    low: { minConfidence: 75, maxVariance: 5 },
    moderate: { minConfidence: 60, maxVariance: 8 },
    high: { minConfidence: 45 }
  },

  // Persistence
  DATA_DIR: 'data',
  PARLAYS_FILE: 'data/parlays.json'
};

