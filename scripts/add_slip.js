const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/parlays.json');

function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({ slips: [] }, null, 2));
  }
  const raw = fs.readFileSync(DATA_PATH, 'utf8') || '';
  let parsed = {};
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    parsed = { slips: [] };
  }
  if (Array.isArray(parsed)) {
    parsed = { parlays: parsed, slips: [] };
  }
  parsed.parlays = parsed.parlays || [];
  parsed.slips = parsed.slips || [];
  return parsed;
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// Build slip per user request
const data = loadData();

const slip = {
  id: `slip_${Date.now()}`,
  createdAt: new Date().toISOString(),
  mode: 'moonshot',
  picks: [
    { player: 'Stephen Curry', market: 'points', hit: null },
    { player: 'Giannis Antetokounmpo', market: 'rebounds', hit: null }
  ],
  result: null
};

data.slips.push(slip);
saveData(data);
console.log('Added slip:', slip.id);
