// NBABot pick classifier implementing README thresholds and rules.
// Place at: NBABot/nbabot/src/lib/pickClassifier.js
//
// Exports:
//  - classifyPick({ hits, games, window, odds }, mode)
//  - isGlobalBad(hits, games, window)
//  - moonshotEligible(hits, games, window, odds)
//  - computeConfidence(hits, games)

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

const GLOBAL_BAD = {
  5:   [1, 2],
  10:  [1, 5],
  15:  [1, 6],
};

const SAFE_THRESH = {
  5:  [4, 5],
  10: [8, 10],
  15: [13, 15],
};

const NORMAL_THRESH = {
  5:  [3, 5],
  10: [6, 10],
  15: [8, 15],
};

const MOONSHOT_MIN = {
  5:  3,
  10: 6,
  15: 8,
};

function toNumberOdds(odds) {
  // Accept numbers or strings like "+125" or "125".
  if (odds === undefined || odds === null) return null;
  if (typeof odds === 'number') return odds;
  const s = String(odds).trim();
  // remove leading +
  const normalized = s.startsWith('+') ? s.slice(1) : s;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function isGlobalBad(hits, games, window) {
  const range = GLOBAL_BAD[window];
  if (!range) return false;
  // global bad is inclusive between range[0] and range[1]
  return hits >= range[0] && hits <= range[1];
}

function inRange(hits, window, table) {
  const range = table[window];
  if (!range) return false;
  return hits >= range[0] && hits <= range[1];
}

function moonshotEligible(hits, games, window, odds) {
  if (isGlobalBad(hits, games, window)) return false;
  const minHits = MOONSHOT_MIN[window] ?? 0;
  if (hits < minHits) return false;
  const numOdds = toNumberOdds(odds);
  if (numOdds === null) return false;
  // Require American-style underdog-ish odds: +100 or higher.
  return numOdds >= 100;
}

function computeConfidence(hits, games) {
  if (!Number.isFinite(games) || games <= 0) return 0;
  let base = (hits / games) * 100;
  // Slight sample-size adjustments per README
  if (games >= 15) base += 5;
  else if (games <= 5) base -= 5;
  // clamp & round
  return Math.round(clamp(base, 0, 100));
}

/**
 * classifyPick
 * @param {Object} pick { hits, games, window, odds }
 * @param {string} mode 'safe'|'normal'|'moonshot'
 * @returns {Object} { label, reason, confidence }
 * label ∈ { 'REJECT', 'SAFE', 'NORMAL', 'MOONSHOT' }
 */
function classifyPick({ hits = 0, games = 0, window = 10, odds = null } = {}, mode = 'normal') {
  const reasonParts = [];
  const confidence = computeConfidence(hits, games);
  // Validate window
  if (![5, 10, 15].includes(window)) {
    return {
      label: 'REJECT',
      reason: `Invalid sample window ${window}. Allowed: 5,10,15.`,
      confidence,
    };
  }

  // Global bad check
  if (isGlobalBad(hits, games, window)) {
    return {
      label: 'REJECT',
      reason: 'Global bad pick (blocked in all modes)',
      confidence,
    };
  }

  // Moonshot mode first check
  if (mode === 'moonshot') {
    if (moonshotEligible(hits, games, window, odds)) {
      return {
        label: 'MOONSHOT',
        reason: 'Eligible for moonshot: recent capability + odds ≥ +100',
        confidence,
      };
    }
    reasonParts.push('Not eligible for moonshot; falling back to normal rules');
    mode = 'normal';
  }

  // Safe mode rules
  if (mode === 'safe') {
    if (inRange(hits, window, SAFE_THRESH)) {
      return {
        label: 'SAFE',
        reason: 'Meets SAFE thresholds for this window',
        confidence,
      };
    }
    if (inRange(hits, window, NORMAL_THRESH)) {
      return {
        label: 'NORMAL',
        reason: 'Below SAFE threshold; within NORMAL range',
        confidence,
      };
    }
    return {
      label: 'REJECT',
      reason: 'Below NORMAL threshold — rejected in SAFE mode',
      confidence,
    };
  }

  // Normal mode rules
  if (mode === 'normal') {
    if (inRange(hits, window, SAFE_THRESH)) {
      return {
        label: 'SAFE',
        reason: 'Meets SAFE thresholds for this window',
        confidence,
      };
    }
    if (inRange(hits, window, NORMAL_THRESH)) {
      return {
        label: 'NORMAL',
        reason: 'Within NORMAL thresholds for this window',
        confidence,
      };
    }
    return {
      label: 'REJECT',
      reason: 'Below NORMAL threshold — rejected',
      confidence,
    };
  }

  // Unknown mode
  return {
    label: 'REJECT',
    reason: `Unknown mode "${mode}"`,
    confidence,
  };
}

module.exports = {
  isGlobalBad,
  moonshotEligible,
  classifyPick,
  computeConfidence,
};