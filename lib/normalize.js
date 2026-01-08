// Normalization utilities — improved parsing for desc -> player/team extraction
// Usage: const { normalizeParlay, normalizePick } = require('./lib/normalize');

function parseDescPlayer(desc) {
  if (!desc || typeof desc !== 'string') return null;
  // Patterns like:
  // "Stephen Curry Over 28.5 Points"
  // "Player A Over 28.5 Points"
  // "Team X Over 114.5"
  // We'll try several heuristics.
  // 1) Look for "Over" or "Under" and take text before that.
  const m = desc.match(/^(.+?)\s+(?:Over|Under)\b/i);
  if (m && m[1]) return m[1].trim();
  // 2) Fallback: capture sequence before a numeric / point token
  const m2 = desc.match(/^(.+?)\s+\d/);
  if (m2 && m2[1]) return m2[1].trim();
  // 3) final fallback: return entire desc (so it's never empty)
  return desc.trim();
}

function inferMarketFromDesc(desc) {
  if (!desc || typeof desc !== 'string') return null;
  desc = desc.toLowerCase();
  if (desc.includes('points')) return 'points';
  if (desc.includes('rebounds')) return 'rebounds';
  if (desc.includes('threes') || desc.includes('3pt') || desc.includes('three')) return 'threesMade';
  if (desc.includes('spread')) return 'spread';
  if (desc.match(/\bover\b|\bunder\b/)) return 'total';
  return null;
}

function explanationFromSources(sources) {
  if (!sources) return '';
  // prefer statMuse url
  if (sources.statMuse && sources.statMuse.url) return `Source: ${sources.statMuse.url}`;
  // prefer any url inside sources objects
  const urls = [];
  const collect = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const v of Object.values(obj)) {
      if (typeof v === 'string' && v.startsWith('http')) urls.push(v);
      else if (typeof v === 'object') collect(v);
    }
  };
  collect(sources);
  if (urls.length) return `Sources: ${urls.join(', ')}`;
  // Last resort: JSON stringify (safe)
  try { return JSON.stringify(sources); } catch (e) { return String(sources); }
}

function colorFromConfidence(c) {
  if (c == null) return 'grey';
  if (c >= 80) return 'green';
  if (c >= 60) return 'orange';
  return 'red';
}

function riskFromConfidence(c) {
  if (c == null) return 'unknown';
  if (c >= 75) return 'low';
  if (c >= 50) return 'high';
  return 'very_high';
}

function normalizePick(raw) {
  const p = {};
  // canonical player / team fields
  p.playerName = raw.playerName || raw.player || parseDescPlayer(raw.desc) || null;
  // if the pick is a team pick, caller can check market and use teamName instead
  p.teamName = raw.teamName || raw.team || (p.playerName && /^team\s+/i.test(p.playerName) ? p.playerName : null);
  // market & line
  p.market = raw.market || inferMarketFromDesc(raw.desc) || null;
  p.line = ('line' in raw) ? raw.line : (raw.lineValue || null);
  p.odds = ('odds' in raw) ? raw.odds : (raw.oddsValue || null);
  p.confidence = (raw.confidence != null) ? Number(raw.confidence) : null;
  p.playingToday = ('playingToday' in raw) ? !!raw.playingToday : false;
  p.hits = ('hits' in raw) ? raw.hits : (raw.hitsCount || null);
  p.games = ('games' in raw) ? raw.games : (raw.gameCount || null);
  // Clean explanation: if explanation is object, create safe string; prefer source URLs
  if (typeof raw.explanation === 'string' && raw.explanation.trim().length) {
    p.explanation = raw.explanation.trim();
  } else {
    p.explanation = explanationFromSources(raw.sources || raw);
  }
  // Derive color / risk
  p.confidenceColor = raw.confidenceColor || colorFromConfidence(p.confidence);
  p.risk = raw.risk || riskFromConfidence(p.confidence);
  // keep raw for debugging
  p._raw = raw;
  return p;
}

function normalizeParlay(raw) {
  const p = {};
  p.id = raw.id || (raw.meta && raw.meta.generatedAt) || `parlay_${Date.now()}`;
  p.timestamp = raw.timestamp || raw.createdAt || (raw.meta && raw.meta.generatedAt) || new Date().toISOString();
  p.meta = raw.meta || {};
  p.picks = (raw.picks || []).map(normalizePick);
  return p;
}

module.exports = { normalizePick, normalizeParlay, parseDescPlayer, inferMarketFromDesc, explanationFromSources };