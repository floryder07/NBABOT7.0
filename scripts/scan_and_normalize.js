// Scan pasted2.json, report picks missing player/team names, write normalized_parlays.json
// Usage: node scripts/scan_and_normalize.js pasted2.json
const fs = require('fs');
const path = require('path');
const { normalizeParlay } = require('../lib/normalize');

const infile = process.argv[2] || path.join(__dirname, '..', 'data', 'pasted2.json');
const outfile = path.join(__dirname, '..', 'data', 'normalized_parlays.json');

if (!fs.existsSync(infile)) {
  console.error('Input file not found:', infile);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(infile, 'utf8'));
const parlays = (raw.parlays || []).map(normalizeParlay);
const slips = (raw.slips || []).map(normalizeParlay); // reuse shape for slips if needed

let missingPlayerCount = 0;
let missingTeamCount = 0;
parlays.forEach(p => {
  p.picks.forEach(pk => {
    if (!pk.playerName && !pk.teamName) missingPlayerCount++;
    if (pk.teamName && !pk.playerName) missingTeamCount++;
  });
});

console.log(`Parlays: ${parlays.length}, Slips: ${slips.length}`);
console.log(`Picks missing both playerName and teamName: ${missingPlayerCount}`);
console.log(`Picks that look like team picks (teamName present): ${missingTeamCount}`);

fs.writeFileSync(outfile, JSON.stringify({ parlays, slips }, null, 2));
console.log('Wrote normalized parlays to', outfile);
console.log('Open normalized_parlays.json and inspect a few entries. Then point your bot to use that file or replace the data source.');