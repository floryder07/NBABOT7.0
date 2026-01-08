const { classifyPick } = require('../lib/pickClassifier');
// const { explainPick } = require('../lib/aiInsights'); // optional - only if you want AI explanations

async function handleParlayCommand({
  legs = 4,
  mode = 'normal',
  window = 10,
  fetchCandidatePicks = null,
  respond = null,
} = {}) {
  legs = Number(legs) || 4;
  if (![5, 10, 15].includes(Number(window))) window = 10;
  mode = String(mode || 'normal').toLowerCase();
  if (!['safe', 'normal', 'moonshot'].includes(mode)) mode = 'normal';

  async function defaultFetchCandidatePicks(win) {
    return [
      { id: 'p1', desc: 'Player A Over 28.5 Points', hits: 9, games: 10, window: win, odds: -120 },
      { id: 'p2', desc: 'Player B 3PT Over 3.5', hits: 3, games: 5, window: win, odds: '+125' },
      { id: 'p3', desc: 'Team X Over 114.5', hits: 10, games: 15, window: win, odds: -110 },
      { id: 'p4', desc: 'Player C Rebounds Over 6.5', hits: 3, games: 5, window: win, odds: -105 },
    ];
  }

  const fetcher = typeof fetchCandidatePicks === 'function' ? fetchCandidatePicks : defaultFetchCandidatePicks;

  const candidates = await fetcher(window);
  if (!Array.isArray(candidates) || candidates.length === 0) {
    const emptyMessage = [{ title: 'No picks available', description: 'No candidate picks were returned for the requested window.' }];
    if (typeof respond === 'function') {
      await respond({ embeds: emptyMessage });
      return [];
    }
    return [];
  }

  const classified = candidates.map(p => {
    const cls = classifyPick(
      { hits: Number(p.hits) || 0, games: Number(p.games) || 0, window: Number(p.window) || window, odds: p.odds },
      mode
    );
    return { ...p, classification: cls };
  });

  let selected = [];
  if (mode === 'safe') {
    selected = classified.filter(c => c.classification.label === 'SAFE').slice(0, legs);
  } else if (mode === 'normal') {
    const safe = classified.filter(c => c.classification.label === 'SAFE');
    const normal = classified.filter(c => c.classification.label === 'NORMAL');
    selected = safe.concat(normal).slice(0, legs);
  } else if (mode === 'moonshot') {
    const moon = classified.filter(c => c.classification.label === 'MOONSHOT');
    const fallback = classified.filter(c => c.classification.label === 'NORMAL' || c.classification.label === 'SAFE');
    selected = moon.concat(fallback).slice(0, legs);
  } else {
    const safe = classified.filter(c => c.classification.label === 'SAFE');
    const normal = classified.filter(c => c.classification.label === 'NORMAL');
    selected = safe.concat(normal).slice(0, legs);
  }

  const results = [];
  for (const s of selected) {
    results.push({
      id: s.id,
      playerName: s.playerName || null,
      teamName: s.teamName || null,
      pick: s.desc,
      hits: s.hits,
      games: s.games,
      hitRate: `${s.hits} / ${s.games}`,
      odds: s.odds,
      label: `${s.hits}/${s.games} games hit`,
      reason: s.classification.reason,
      confidence: s.classification.confidence,
    });
  }

  if (typeof respond === 'function') {
    const lines = results.map(r => {
      const entity = r.playerName || r.teamName || r.pick || 'Unknown';
      return `**${entity}**\nHit Rate: ${r.hits}/${r.games} — Odds: ${r.odds}\nLabel: ${r.label}\nReason: ${r.reason}`;
    });

    const embed = {
      title: `Parlay (${mode.toUpperCase()}) — ${results.length}/${legs} legs`,
      description: lines.join('\n\n') || 'No suitable picks found for the selected mode.',
      timestamp: new Date().toISOString(),
    };

    await respond({ embeds: [embed] });
    return results;
  }

  return results;
}

module.exports = { handleParlayCommand };

// Rendering safety: always use canonical fields and safe fallbacks
// Example embed field creation snippet; integrate into your existing renderer
function formatPickDisplay(pick) {
  // Choose the label: prefer playerName, then teamName, then desc, then "Unknown"
  const titleEntity = pick.playerName || pick.teamName || (pick._raw && pick._raw.desc) || 'Unknown';
  const market = (pick.market ? ` — ${pick.market.toUpperCase()}` : '');
  const line = (pick.line != null ? ` ${pick.line}` : '');
  const title = `${titleEntity}${market}${line}`;
  const confidence = pick.confidence != null ? `${Math.round(pick.confidence)}%` : 'N/A';
  const hitRate = (pick.hits != null && pick.games != null) ? `${pick.hits} / ${pick.games}` : (pick.confidence != null ? `${confidence}` : 'N/A');
  const explanation = pick.explanation || '';
  return {
    name: title,
    value: `Confidence: ${confidence}\nHit Rate: ${hitRate}${explanation ? `\n\n${explanation}` : ''}`
  };
}

module.exports.formatPickDisplay = formatPickDisplay;
