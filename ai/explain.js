// Simple explanation generator for picks
function generateExplanation(pick) {
  const parts = [];
  parts.push(`Confidence ${Math.round(pick.confidence || 0)}% — inferred from combined sources.`);

  if (pick.playingToday) parts.push('Player is scheduled to play today.');
  if (pick.sources && pick.sources.statMuse) parts.push('StatMuse reference available.');
  if (pick.sources && pick.sources.odds) parts.push(`Line available from bookmaker: ${pick.sources.odds.line || pick.line}`);

  // Add a short suggestion tone based on confidence
  const c = pick.confidence || 0;
  if (c >= 75) parts.push('Strong pick — low risk.');
  else if (c >= 55) parts.push('Solid pick — consider as part of a balanced parlay.');
  else parts.push('Low confidence — higher variance expected.');

  return parts.join(' ');
}

module.exports = { generateExplanation };
