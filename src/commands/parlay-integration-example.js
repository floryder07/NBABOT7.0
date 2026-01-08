// NBABot - Example parlay selection integration
// Place at: NBABot/nbabot/src/commands/parlay-integration-example.js
//
// This file is an integration example showing how to apply the classifier
// to a set of candidate picks and build a parlay response. It does NOT
// replace your existing command automatically — import/classifyPick and
// adapt your command handler accordingly.

const { classifyPick } = require('../lib/pickClassifier');
const { explainPick } = require('../lib/aiInsights');

/**
 * buildParlayFromCandidates
 * @param {Array} candidates - array of candidate pick objects:
 *    { id, desc, hits, games, window, odds }
 * @param {number} legs - how many picks desired
 * @param {string} mode - 'safe' | 'normal' | 'moonshot'
 * @returns {Promise<Array>} selected picks with classification and insight
 */
async function buildParlayFromCandidates(candidates = [], legs = 4, mode = 'normal') {
  const window = candidates.length > 0 ? (candidates[0].window || 10) : 10;

  // 1) Classify candidates
  const classified = candidates.map(p => {
    const cls = classifyPick(
      { hits: p.hits, games: p.games, window: p.window || window, odds: p.odds },
      mode
    );
    return { ...p, classification: cls };
  });

  // 2) Select according to mode
  let selected = [];

  if (mode === 'safe') {
    selected = classified.filter(c => c.classification.label === 'SAFE').slice(0, legs);
  } else if (mode === 'normal') {
    const safe = classified.filter(c => c.classification.label === 'SAFE');
    const normal = classified.filter(c => c.classification.label === 'NORMAL');
    selected = safe.concat(normal).slice(0, legs);
  } else if (mode === 'moonshot') {
    const moon = classified.filter(c => c.classification.label === 'MOONSHOT');
    const fallback = classified.filter(c =>
      c.classification.label === 'SAFE' || c.classification.label === 'NORMAL'
    );
    selected = moon.concat(fallback).slice(0, legs);
  } else {
    // unknown mode -> use normal fallback
    const safe = classified.filter(c => c.classification.label === 'SAFE');
    const normal = classified.filter(c => c.classification.label === 'NORMAL');
    selected = safe.concat(normal).slice(0, legs);
  }

  // 3) Attach AI explanations (optional): note this is pure explanation and asynchronous
  const results = [];
  for (const s of selected) {
    const explanation = await explainPick({
      desc: s.desc,
      hits: s.hits,
      games: s.games,
      window: s.window || window,
      odds: s.odds,
      classification: s.classification,
    }).catch(err => `AI explanation failed: ${String(err)}`);
    results.push({
      pick: s.desc,
      hits: s.hits,
      games: s.games,
      hitRate: `${s.hits} / ${s.games}`,
      odds: s.odds,
      label: s.classification.label,
      reason: s.classification.reason,
      confidence: s.classification.confidence,
      aiExplanation: explanation,
    });
  }

  return results;
}

// Example usage (for manual testing)
// (Uncomment and run in Node to test integration)
async function exampleRun() {
  const candidates = [
    { id: 'p1', desc: 'Player O 28.5 Points', hits: 9, games: 10, window: 10, odds: -120 },
    { id: 'p2', desc: 'Player O 3.5 3PT', hits: 3, games: 5, window: 5, odds: 125 },
    { id: 'p3', desc: 'Team O 114.5', hits: 10, games: 15, window: 15, odds: -110 },
    { id: 'p4', desc: 'Player O 6.5 Rebounds', hits: 3, games: 5, window: 5, odds: -105 },
  ];
  const parlay = await buildParlayFromCandidates(candidates, 3, 'moonshot');
  console.log(JSON.stringify(parlay, null, 2));
}

// exampleRun();

module.exports = { buildParlayFromCandidates };