#!/usr/bin/env node

const readline = require('readline');
const ParlayCommand = require('./commands/parlay');
const WhyCommand = require('./commands/why');
const InsightsCommand = require('./commands/insights');
const GradeCommand = require('./commands/grade');
const HistoryCommand = require('./commands/history');
const PickOfDayCommand = require('./commands/pickoftheday');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'NBABot> '
});

console.log('╔════════════════════════════════════════╗');
console.log('║       NBABot CLI Simulator            ║');
console.log('║   NBA Analytics Terminal Interface     ║');
console.log('╚════════════════════════════════════════╝');
console.log('');
console.log('Available commands:');
console.log('  /parlay [--legs <2-10>] [--mode <safe|normal|moonshot>] [--window <last_5|last_10|last_15>]');
console.log('  /help - Show help');
console.log('  /exit - Exit simulator');
  console.log('  /why <pickNumber> - Explain a pick from latest parlay');
  console.log('  /insights <pickNumber> - Show detailed insights for a pick');
  console.log('  /grade slip:<id|latest> result:<win|loss> - Grade a slip');
  console.log('  /history [limit] - Show recent parlay history');
  console.log('  /pickoftheday - Show top picks (CLI)');
console.log('');

rl.prompt();

rl.on('line', async (line) => {
  const input = line.trim();

  if (!input) {
    rl.prompt();
    return;
  }

  if (input === '/exit') {
    console.log('Goodbye! 👋');
    process.exit(0);
  }

  if (input === '/help') {
    showHelp();
    rl.prompt();
    return;
  }

    try {
      if (input.startsWith('/parlay')) {
        await ParlayCommand.execute(input);
      } else if (input.startsWith('/why')) {
        await WhyCommand.execute(input);
      } else if (input.startsWith('/pickoftheday')) {
        await PickOfDayCommand.execute();
      } else if (input.startsWith('/insights')) {
        await InsightsCommand.execute(input);
      } else if (input.startsWith('/grade')) {
        await GradeCommand.execute(input);
      } else if (input.startsWith('/history')) {
        await HistoryCommand.execute(input);
      } else {
        console.log('❌ Unknown command. Type /help for available commands.');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }

  console.log('');
  rl.prompt();
});

function showHelp() {
  console.log('');
  console.log('📖 NBABot Commands');
  console.log('');
  console.log('/parlay --legs <2-10> --mode <safe|normal|moonshot> --window <last_5|last_10|last_15>');
  console.log('  Generate a multi-leg analytical parlay');
  console.log('  Examples:');
  console.log('    /parlay --legs 3 --mode safe');
  console.log('    /parlay --legs 5 --mode moonshot --window last_5');
  console.log('');
  console.log('/help - Show this help message');
  console.log('/exit - Exit the simulator');
  console.log('');
}

rl.on('close', () => {
  console.log('Goodbye! 👋');
  process.exit(0);
});
