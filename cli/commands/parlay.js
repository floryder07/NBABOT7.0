const fs = require('fs');
const path = require('path');
const Player = require('../../src/data/models/Player');
const Pick = require('../../src/data/models/Pick');
const TrendAnalyzer = require('../../src/core/signals/TrendAnalyzer');
const ColorMapper = require('../../src/core/confidence/ColorMapper');
const ExplanationGenerator = require('../../src/core/explanation/ExplanationGenerator');
const { MODE_CRITERIA, RISK_CONFIG, PARLAYS_FILE, DATA_DIR } = require('../../src/config/constants');
const DataManager = require('../../src/data/ingestion/DataManager');
const { getExplanation } = require('../../ai');

// MOCK NBA DATA
const MOCK_PLAYERS = [
  {
    id: 'player_1',
    name: 'Stephen Curry',
    team: 'Golden State Warriors',
    position: 'PG',
    recentGames: [
      { points: 32, rebounds: 5, assists: 8, threesMade: 7 },
      { points: 28, rebounds: 4, assists: 6, threesMade: 5 },
      { points: 35, rebounds: 6, assists: 9, threesMade: 8 },
      { points: 26, rebounds: 3, assists: 7, threesMade: 4 },
      { points: 30, rebounds: 5, assists: 8, threesMade: 6 },
      { points: 27, rebounds: 4, assists: 6, threesMade: 5 },
      { points: 33, rebounds: 6, assists: 10, threesMade: 7 },
      { points: 29, rebounds: 4, assists: 7, threesMade: 6 },
      { points: 31, rebounds: 5, assists: 8, threesMade: 6 },
      { points: 25, rebounds: 3, assists: 6, threesMade: 4 }
    ]
  },
  {
    id: 'player_2',
    name: 'LeBron James',
    team: 'Los Angeles Lakers',
    position: 'PF',
    recentGames: [
      { points: 25, rebounds: 8, assists: 9, threesMade: 2 },
      { points: 28, rebounds: 7, assists: 10, threesMade: 3 },
      { points: 22, rebounds: 9, assists: 11, threesMade: 1 },
      { points: 27, rebounds: 8, assists: 8, threesMade: 2 },
      { points: 30, rebounds: 10, assists: 7, threesMade: 3 },
      { points: 26, rebounds: 8, assists: 9, threesMade: 2 },
      { points: 24, rebounds: 9, assists: 10, threesMade: 2 },
      { points: 29, rebounds: 7, assists: 8, threesMade: 3 },
      { points: 23, rebounds: 8, assists: 12, threesMade: 1 },
      { points: 26, rebounds: 9, assists: 9, threesMade: 2 }
    ]
  },
  {
    id: 'player_3',
    name: 'Giannis Antetokounmpo',
    team: 'Milwaukee Bucks',
    position: 'PF',
    recentGames: [
      { points: 38, rebounds: 14, assists: 5, threesMade: 1 },
      { points: 35, rebounds: 12, assists: 6, threesMade: 0 },
      { points: 40, rebounds: 15, assists: 4, threesMade: 2 },
      { points: 32, rebounds: 11, assists: 7, threesMade: 1 },
      { points: 36, rebounds: 13, assists: 5, threesMade: 1 },
      { points: 34, rebounds: 12, assists: 6, threesMade: 0 },
      { points: 39, rebounds: 14, assists: 5, threesMade: 1 },
      { points: 33, rebounds: 10, assists: 8, threesMade: 1 },
      { points: 37, rebounds: 13, assists: 6, threesMade: 2 },
      { points: 31, rebounds: 11, assists: 7, threesMade: 0 }
    ]
  }
];

class ParlayCommand {
  constructor() {
    this.trendAnalyzer = new TrendAnalyzer();
    this.colorMapper = new ColorMapper();
    this.explanationGen = new ExplanationGenerator();
    this.dataManager = new DataManager();
  }

  async execute(input) {
    const options = this.parseOptions(input);
    
    console.log(`\n🎯 Generating Parlay...\n`);
    console.log(`Mode: ${options.mode.toUpperCase()}`);
    console.log(`Legs: ${options.legs}`);
    console.log(`Window: ${options.window}\n`);
    console.log('─'.repeat(60));

    const picks = await this.generatePicks(options);
    await this.displayParlay(picks, options);
  }

  parseOptions(input) {
    const defaults = { legs: 3, mode: 'normal', window: 'last_10' };
    const parts = input.split('--').slice(1);
    const options = { ...defaults };

    parts.forEach(part => {
      const [key, value] = part.trim().split(/\s+/);
      if (key === 'legs') options.legs = parseInt(value) || 3;
      if (key === 'mode') options.mode = value || 'normal';
      if (key === 'window') options.window = value || 'last_10';
    });

    return options;
  }

  async generatePicks(options) {
    const picks = [];

    // FOR NOW: Always use mock data with real calculations
    console.log('🔍 Using mock player data with real confidence calculations...');
    const playerData = MOCK_PLAYERS;

    const propLines = this.extractPropLines(playerData);

    playerData.forEach(playerInfo => {
      const player = new Player(playerInfo);
      const lines = propLines[player.name];
      if (!lines) return;

      Object.entries(lines).forEach(([market, line]) => {
        const pick = this.analyzePick(player, market, line, options);
        if (pick && this.meetsModeCriteria(pick, options.mode)) {
          picks.push(pick);
        }
      });
    });

    picks.sort((a, b) => b.confidence - a.confidence);
    return picks.slice(0, options.legs);
  }

  convertPropsToPlayerData(props) {
    const playerMap = {};

    props.forEach(prop => {
      const name = prop.playerName || prop.player || prop.player_name;
      if (!name) return;

      if (!playerMap[name]) {
        playerMap[name] = {
          id: (name || '').toLowerCase().replace(/\s+/g, '_'),
          name,
          team: (prop.game && prop.game.split(' vs ')[0]) || prop.team || 'Unknown',
          position: prop.position || 'Unknown',
          recentGames: this.generateMockRecentGames(prop.market || 'points', prop.line || 20)
        };
      }
    });

    return Object.values(playerMap);
  }

  generateMockRecentGames(market, line) {
    const games = [];
    for (let i = 0; i < 10; i++) {
      const variance = (Math.random() - 0.5) * 10;
      games.push({
        points: market === 'points' ? Math.round(line + variance) : Math.round(20 + Math.random() * 15),
        rebounds: market === 'rebounds' ? Math.round(line + variance) : Math.round(5 + Math.random() * 8),
        assists: market === 'assists' ? Math.round(line + variance) : Math.round(4 + Math.random() * 8),
        threesMade: Math.round(2 + Math.random() * 6)
      });
    }
    return games;
  }

  extractPropLines(playerData) {
    const lines = {
      'Stephen Curry': { points: 28.5, threesMade: 5.5 },
      'LeBron James': { points: 25.5, rebounds: 8.5, assists: 9.5 },
      'Giannis Antetokounmpo': { points: 34.5, rebounds: 12.5 }
    };

    playerData.forEach(player => {
      if (!lines[player.name] && player.recentGames && player.recentGames.length > 0) {
        const avgPoints = player.recentGames.reduce((sum, g) => sum + (g.points || 0), 0) / player.recentGames.length;
        lines[player.name] = { points: Math.round(avgPoints * 2) / 2 };
      }
    });

    return lines;
  }

  analyzePick(player, market, line, options) {
    const trend = this.trendAnalyzer.analyzePlayerTrend(player, market, line, options.window);
    const confidence = trend.confidence;
    if (confidence < 35) return null;

    const explanation = this.explanationGen.generate({ line, market }, { trend });
    const risk = this.calculateRisk(confidence, trend.variance);

    return new Pick({
      player, market, line, confidence,
      confidenceColor: trend.color,
      mode: options.mode,
      explanation,
      trendCount: trend.hitCount,
      trendWindow: options.window,
      odds: this.generateOdds(confidence),
      risk
    });
  }

  meetsModeCriteria(pick, mode) {
    const cfg = MODE_CRITERIA[mode] || MODE_CRITERIA['normal'];
    if (cfg.requiredColor) return pick.confidenceColor === cfg.requiredColor && pick.confidence >= cfg.minConfidence;
    if (cfg.requiredColors) return cfg.requiredColors.includes(pick.confidenceColor) && pick.confidence >= cfg.minConfidence;
    return pick.confidence >= cfg.minConfidence;
  }

  calculateRisk(confidence, variance) {
    if (confidence >= RISK_CONFIG.low.minConfidence && variance < RISK_CONFIG.low.maxVariance) return 'low';
    if (confidence >= RISK_CONFIG.moderate.minConfidence && variance < RISK_CONFIG.moderate.maxVariance) return 'moderate';
    if (confidence >= RISK_CONFIG.high.minConfidence) return 'high';
    return 'very_high';
  }

  generateOdds(confidence) {
    if (confidence >= 75) return -200;
    if (confidence >= 65) return -150;
    if (confidence >= 55) return -120;
    if (confidence >= 45) return -110;
    return +100;
  }

  async displayParlay(picks, options) {
    if (picks.length === 0) {
      console.log('\n❌ No picks found matching criteria\n');
      return;
    }

    console.log('\n');

    // Enrich each pick with an AI-generated explanation (GPT preferred, deterministic fallback)
    for (let i = 0; i < picks.length; i++) {
      const pick = picks[i];
      const ctx = {
        player: pick.player && pick.player.name ? pick.player.name : (pick.playerName || 'Unknown'),
        market: pick.market || 'points',
        confidence: pick.confidence || 0,
        risk: pick.risk || 'unknown',
        signals: pick.sources || {}
      };
      try {
        const explanation = await getExplanation(ctx);
        pick.explanation = explanation;
      } catch (err) {
        pick.explanation = pick.explanation || 'No explanation available.';
      }
    }
    
    picks.forEach((pick, index) => {
      const emoji = this.colorMapper.getEmoji(pick.confidenceColor);
      const trendDisplay = this.colorMapper.getDisplayString(
        pick.confidenceColor, pick.trendCount,
        this.trendAnalyzer.getWindowSize(pick.trendWindow)
      );

      console.log(`${index + 1}. ${pick.player.name} Over ${pick.line} ${pick.market.toUpperCase()} ${emoji}`);
      console.log(`   ${trendDisplay}`);
      console.log(`   ${pick.explanation}`);
      console.log(`   Confidence: ${pick.confidence.toFixed(0)}% | Risk: ${pick.risk} | Odds: ${pick.odds}`);
      console.log('');
    });

    const totalOdds = this.calculateParlayOdds(picks);
    const overallRisk = this.calculateOverallRisk(picks);

    console.log('─'.repeat(60));
    console.log(`Combined Odds: ${totalOdds}`);
    console.log(`Overall Risk: ${overallRisk}`);
    console.log('\n⚠️  This is analysis, not betting advice\n');

    // Persist parlays
    try {
      this.saveParlay(picks, options, { totalOdds, overallRisk });
    } catch (err) {
      console.error('Failed to save parlay:', err.message);
    }
  }

  saveParlay(picks, options, meta) {
    // write to project-local data directory (based on this file's location)
    const projectRoot = path.resolve(__dirname, '../../..');
    const dir = path.join(projectRoot, DATA_DIR);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = path.join(projectRoot, PARLAYS_FILE);
    let list = [];
    if (fs.existsSync(file)) {
      try { list = JSON.parse(fs.readFileSync(file, 'utf8') || '[]'); } catch (e) { list = []; }
    }

    const entry = {
      id: `parlay_${Date.now()}`,
      timestamp: new Date().toISOString(),
      options,
      meta,
      picks: picks.map(p => ({ player: p.player && p.player.name ? p.player.name : (p.playerName || 'Unknown'), market: p.market, line: p.line, confidence: p.confidence, risk: p.risk, odds: p.odds, explanation: p.explanation || null }))
    };

    list.push(entry);
    fs.writeFileSync(file, JSON.stringify(list, null, 2));
  }

  calculateParlayOdds(picks) {
    let decimal = 1;
    picks.forEach(pick => {
      const odds = pick.odds;
      if (odds < 0) {
        decimal *= (100 / Math.abs(odds)) + 1;
      } else {
        decimal *= (odds / 100) + 1;
      }
    });

    const american = decimal >= 2 
      ? '+' + Math.round((decimal - 1) * 100)
      : '-' + Math.round(100 / (decimal - 1));
    return american;
  }

  calculateOverallRisk(picks) {
    const riskScores = { 'low': 1, 'moderate': 2, 'high': 3, 'very_high': 4 };
    const avgRiskScore = picks.reduce((sum, pick) => sum + (riskScores[pick.risk] || 2), 0) / picks.length;
    if (avgRiskScore >= 3.5) return 'Very High';
    if (avgRiskScore >= 2.5) return 'High';
    if (avgRiskScore >= 1.5) return 'Moderate';
    return 'Low';
  }
}

module.exports = new ParlayCommand();

