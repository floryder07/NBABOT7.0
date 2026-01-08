const fs = require('fs');
const path = require('path');
const constants = require('../../src/config/constants');

async function execute(input) {
  const parts = input.trim().split(/\s+/);
  const pickNum = parseInt(parts[1], 10);
  const file = path.join(__dirname, '../../', constants.PARLAYS_FILE);
  if (!fs.existsSync(file)) return console.log('No saved parlays found.');
  const list = JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
  if (!list || list.length === 0) return console.log('No saved parlays found.');
  const last = list[list.length - 1];
  if (!pickNum || pickNum < 1) return console.log('Usage: /insights <pickNumber>');
  const pick = last.picks && last.picks[pickNum - 1];
  if (!pick) return console.log(`Pick ${pickNum} not found in latest parlay.`);
  console.log(`\n📊 Insights — ${pick.player}`);
  console.log(`Market: ${pick.market}`);
  console.log(`Line: ${pick.line}`);
  console.log(`Confidence: ${pick.confidence}%`);
  console.log(`Risk: ${pick.risk || 'unknown'}`);
  console.log('\nSources:');
  console.log(pick.sources ? JSON.stringify(pick.sources, null, 2) : 'No source metadata.');
  console.log('\nExplanation:');
  console.log(pick.explanation || 'No explanation available.');
}

module.exports = { execute };
