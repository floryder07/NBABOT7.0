(async ()=>{
  try{
    const DataManager = require('../src/data/ingestion/DataManager');
    const ai = require('../ai');
    const dm = new DataManager();
    const picks = await dm.generateParlay({legs:3,mode:'normal'});
    for (const p of picks) {
      try { p.explanation = await ai.getExplanation({ player: p.playerName, market: p.market, confidence: p.confidence, risk: p.risk || 'unknown', signals: p.sources || {} }); }
      catch (e) { p.explanation = 'No explanation'; }
    }
    console.log('---SIMULATED /parlay REPLY---');
    console.log('🎯 Parlay (NORMAL - 3 legs)');
    picks.forEach((p,i)=>{
      console.log(`${i+1}. ${p.playerName} Over ${p.line} ${p.market.toUpperCase()} — ${Math.round(p.confidence)}%`);
      console.log(`   ${p.explanation.split('\n')[0]}${p.explanation.length>200? '...' : ''}`);
    });
    // Save enhanced parlay
    const saved = await dm.saveParlay(picks, { legs:3, mode:'normal', generatedAt: new Date().toISOString() });
    console.log('\nSaved parlay id:', saved.id);
  } catch (err) {
    console.error('Test error:', err.message);
  }
})();
