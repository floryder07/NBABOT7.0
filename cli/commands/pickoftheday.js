const DataManager = require('../../src/data/ingestion/DataManager');
const ai = require('../../ai');

async function execute() {
  const dm = new DataManager();
  console.log('\n🏆 Pick Of The Day\n');
  try {
    const picks = await dm.generateParlay({ legs: 5, mode: 'normal' });
    if (!picks || picks.length === 0) {
      console.log('No picks available today.');
      return;
    }

    for (let i = 0; i < picks.length; i++) {
      const p = picks[i];
      try {
        const ctx = { player: p.playerName || p.player || 'Unknown', market: p.market || 'points', confidence: p.confidence || 0, risk: p.risk || 'unknown', signals: p.sources || {} };
        p.explanation = await ai.getExplanation(ctx);
      } catch (e) { p.explanation = p.explanation || 'No explanation available.'; }

      console.log(`${i + 1}. ${p.playerName} — Over ${p.line} ${p.market.toUpperCase()} (${Math.round(p.confidence)}%)`);
      console.log(`   ${ (p.explanation || '').split('\n')[0] }`);
      console.log('');
    }
  } catch (err) {
    console.error('Error generating pick of the day:', err.message);
  }
}

module.exports = { execute };
