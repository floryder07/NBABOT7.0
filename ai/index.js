const { generateExplanation } = require('./explain');
const { getFallbackProps, explainFallback } = require('./fallback');
let gpt;
try { gpt = require('./gpt'); } catch (e) { gpt = null; }

async function getExplanation(context) {
  // Try GPT first if available, otherwise use fallback explanation
  if (gpt && typeof gpt.explainWithGPT === 'function') {
    try {
      const res = await gpt.explainWithGPT(context);
      if (res) return res;
    } catch (err) {
      console.warn('⚠️ GPT explanation failed, falling back:', err.message);
    }
  }

  // Use fallback explanation generator
  try {
    return explainFallback(context);
  } catch (err) {
    // Last-resort: local generateExplanation
    return generateExplanation(context);
  }
}

async function explainParlay(options = {}) {
  const legs = options.legs || 3;
  const mode = options.mode || 'normal';
  const picks = await getFallbackProps(legs, mode);

  const explained = await Promise.all(picks.map(async pick => {
    const ctx = {
      player: pick.playerName || pick.player || 'Unknown',
      market: pick.market || 'points',
      confidence: pick.confidence || 0,
      risk: pick.risk || 'unknown',
      signals: pick.sources || {}
    };
    const explanation = await getExplanation(ctx);
    return { ...pick, explanation };
  }));

  return explained;
}

// CLI convenience when run directly
if (require.main === module) {
  (async () => {
    const explained = await explainParlay({ legs: 3, mode: 'normal' });
    console.log(JSON.stringify(explained, null, 2));
  })();
}

module.exports = { explainParlay, getExplanation };
