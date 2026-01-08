const DataManager = require('./src/data/ingestion/DataManager');

async function run() {
  const dm = new DataManager();
  const players = ['Stephen Curry', 'LeBron James', 'Giannis Antetokounmpo'];
  for (const p of players) {
    console.log('\n--- Aggregating:', p);
    const agg = await dm.aggregatePlayerInfo(p);
    console.log(JSON.stringify(agg, null, 2));
  }
}

run();
