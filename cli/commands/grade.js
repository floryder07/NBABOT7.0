const fs = require('fs');
const path = require('path');
const constants = require('../../src/config/constants');

async function execute(input) {
  // expected: /grade slip:latest result:win
  const parts = input.trim().split(/\s+/).slice(1);
  const args = {};
  parts.forEach(p => {
    const [k, v] = p.split(':');
    if (k && v) args[k] = v;
  });
  const slip = args.slip || 'latest';
  const result = (args.result || '').toLowerCase();
  if (!['win', 'loss'].includes(result)) return console.log('Usage: /grade slip:<id|latest> result:<win|loss>');
  const file = path.join(__dirname, '../../', constants.PARLAYS_FILE);
  if (!fs.existsSync(file)) return console.log('No saved parlays found.');
  const list = JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
  if (!list || list.length === 0) return console.log('No saved parlays found.');
  let entry;
  if (slip === 'latest') entry = list[list.length - 1]; else entry = list.find(e => e.id === slip);
  if (!entry) return console.log('Slip not found.');
  entry.meta = entry.meta || {};
  entry.meta.result = result;
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
  console.log(`Recorded result=${result} for ${entry.id}`);
}

module.exports = { execute };
