// Quick integration test for new ingestion clients
async function main() {
  try {
    const DataManager = require('./src/data/ingestion/DataManager');
    const SofaScoreAPI = require('./src/data/ingestion/SofaScoreAPI');
    const StatMuseAPI = require('./src/data/ingestion/StatMuseAPI');

    const dm = new DataManager();
    const sofa = new SofaScoreAPI();
    const stat = new StatMuseAPI();

    console.log('--- DataManager.getPlayerProps() ---');
    const props = await dm.getPlayerProps();
    console.log('Props result:', Array.isArray(props) ? `${props.length} items` : props);

    console.log('\n--- DataManager.getTodaysGames() ---');
    const games = await dm.getTodaysGames();
    console.log('Todays games:', Array.isArray(games) ? `${games.length} items` : games);

    console.log('\n--- SofaScoreAPI.getTodaysNBAGames() ---');
    const sGames = await sofa.getTodaysNBAGames();
    console.log('SofaScore games:', Array.isArray(sGames) ? `${sGames.length} items` : sGames);

    console.log('\n--- SofaScoreAPI.getLiveScores() ---');
    const live = await sofa.getLiveScores();
    console.log('Live games:', Array.isArray(live) ? `${live.length} items` : live);

    console.log('\n--- StatMuseAPI query (via DataManager.queryStatMuse) ---');
    const sm = await dm.queryStatMuse('who leads the nba in points per game this season');
    console.log('StatMuse result (truncated):', sm && typeof sm === 'string' ? sm.slice(0,200) : sm);

    console.log('\nTest finished');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(2);
  }
}

main();
