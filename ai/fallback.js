const DataManager = require('../src/data/ingestion/DataManager');

async function getFallbackProps(legs = 3, mode = 'normal') {
  const dm = new DataManager();
  // Use generateParlay which prioritizes SofaScore+StatMuse and persists
  const picks = await dm.generateParlay({ legs, mode });
  return picks;
}

function explainFallback(ctx) {
  const signals = Object.entries(ctx.signals || {})
    .map(([k, v]) => `• ${k.replace("_", " ")}: ${v}`)
    .join("\n");

  return `
${ctx.player} — ${ctx.market.toUpperCase()}

Confidence: ${ctx.confidence}%
Risk Level: ${ctx.risk}

Reasoning:
${signals || "Based on recent performance trends and matchup context."}

Note:
Higher risk indicates increased volatility relative to the line.
This explanation is generated without AI due to availability limits.
`.trim();
}

module.exports = { getFallbackProps, explainFallback };
