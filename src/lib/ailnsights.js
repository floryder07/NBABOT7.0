// NBABot AI explanation helper (explanation-only).
// Place at: NBABot/nbabot/src/lib/aiInsights.js
//
// This module provides a single function `explainPick` that returns
// a human-readable explanation string for a pick and its classification.
// IMPORTANT: This must never alter classification or confidence.
//
// It is a small, generic wrapper. Replace the `aiClientCall` with your
// bot's actual AI/OpenAI client call (if you use one).

async function aiClientCall(prompt) {
  // TODO: Swap this for your existing AI client code.
  // For example, if you use OpenAI's official client:
  // return openai.responses.create({model: 'gpt-4o-mini', input: prompt});
  //
  // Here we return a placeholder synchronous explanatory string.
  return `AI Explanation (placeholder): ${prompt.slice(0, 200)}...`;
}

/**
 * explainPick
 * @param {Object} pick  - { desc, hits, games, window, odds, classification }
 * @returns {Promise<string>} explanation text
 *
 * NOTE: This function must only explain the pick. It should not
 * re-classify or change confidence.
 */
async function explainPick(pick) {
  const { desc, hits, games, window, odds, classification } = pick;
  const label = classification && classification.label ? classification.label : 'UNKNOWN';
  const confidence = classification && classification.confidence != null ? classification.confidence : 'N/A';
  // Construct a deterministic prompt. Instruct the model to only explain.
  const prompt = [
    'You are an explanatory assistant for NBABot. You will only explain WHY the pick was labeled as given.',
    'Do NOT change the label or confidence. Do NOT give predictions or betting advice. Keep the explanation factual and concise.',
    `Pick: ${desc}`,
    `Hit Rate: ${hits} / ${games} (sample window: ${window})`,
    `Odds: ${odds}`,
    `Label: ${label}`,
    `Confidence (descriptive): ${confidence}%`,
    'Explain the recent trend, volatility, and factors the data suggests (lineups, small sample risk, on/off contexts if applicable). Keep to 3–6 short bullet points.'
  ].join('\n');

  const aiResult = await aiClientCall(prompt);
  // If your client returns an object, extract .text / .content accordingly.
  return typeof aiResult === 'string' ? aiResult : String(aiResult);
}

module.exports = { explainPick };