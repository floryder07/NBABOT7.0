require('dotenv').config();
const SofaScoreAPI = require('./src/data/ingestion/SofaScoreAPI');
const StatMuseAPI = require('./src/data/ingestion/StatMuseAPI');

async function test() {
  console.log('🧪 Testing SofaScore and StatMuse...\n');

  const sofaScore = new SofaScoreAPI();
  const statMuse = new StatMuseAPI();

  // Test SofaScore
  console.log('1️⃣ Testing SofaScore...');
  const games = await sofaScore.getTodaysNBAGames();
  const liveScores = await sofaScore.getLiveScores();
  console.log('SofaScore today:', Array.isArray(games) ? `${games.length} games` : games);
  console.log('SofaScore live:', Array.isArray(liveScores) ? `${liveScores.length} live games` : liveScores);
  
  // Test StatMuse
  console.log('\n2️⃣ Testing StatMuse...');
  const leadersURL = await statMuse.getPlayerLeaders('points');
  const curryStats = await statMuse.getPlayerCareerStats('Stephen Curry');
  console.log('StatMuse leaders URL:', leadersURL);
  console.log('StatMuse Curry URL:', curryStats);
  
  console.log('\n✅ Test complete!');
}

test();
