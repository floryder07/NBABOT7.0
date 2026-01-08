const fs = require('fs');
const path = require('path');
const constants = require('../../src/config/constants');

async function execute(input) {
  const parts = input.trim().split(/\s+/);
  const limit = parseInt(parts[1], 10) || 5;
  const file = path.join(__dirname, '../../', constants.PARLAYS_FILE);
  if (!fs.existsSync(file)) return console.log('No saved parlays found.');
  const list = JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
  if (!list || list.length === 0) return console.log('No saved parlays found.');
  const last = list.slice(-limit).reverse();
  console.log('\n📜 Recent Parlays');
  last.forEach(e => {
    console.log(`${e.id} | ${e.meta && e.meta.mode ? e.meta.mode.toUpperCase() : 'N/A'} | ${e.meta && e.meta.generatedAt ? e.meta.generatedAt : e.timestamp || ''} | ${e.meta && e.meta.result ? e.meta.result.toUpperCase() : 'UNGRADED'} | Legs:${e.picks?.length || 0}`);
  });
}

module.exports = { execute };
