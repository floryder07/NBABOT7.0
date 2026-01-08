const OddsAPI = require('./OddsAPI');
const NBAAPI = require('./NBAAPI');
const BallDontLieAPI = require('./BallDontLieAPI');
const SofaScoreAPI = require('./SofaScoreAPI');
const StatMuseAPI = require('./StatMuseAPI');

class DataManager {
  constructor() {
    this.oddsAPI = new OddsAPI();
    this.nbaAPI = new NBAAPI();
    this.ballDontLieAPI = new BallDontLieAPI();
    this.sofaScoreAPI = new SofaScoreAPI();
    this.statMuseAPI = new StatMuseAPI();
    this.useMockData = false;
  }

  async getPlayerProps() {
    console.log('🔍 Building player props using SofaScore + StatMuse first...');

    // 1) Get today's games from SofaScore
    const todaysGames = await this.sofaScoreAPI.getTodaysNBAGames();
    const props = [];

    // fallback player list to attempt to generate props for
    const fallbackNames = ['Stephen Curry', 'LeBron James', 'Giannis Antetokounmpo'];

    if (Array.isArray(todaysGames) && todaysGames.length > 0) {
      // normalize team names for quick lookup
      const teamsPlaying = new Set();
      todaysGames.forEach(g => {
        if (g.homeTeam && g.homeTeam.name) teamsPlaying.add(g.homeTeam.name.toLowerCase());
        if (g.awayTeam && g.awayTeam.name) teamsPlaying.add(g.awayTeam.name.toLowerCase());
      });

      for (const name of fallbackNames) {
        try {
          const enriched = await this.enrichPlayerData(name);
          if (!enriched) continue;

          // check if player's team is playing today
          const playerTeam = (enriched.team || '').toLowerCase();
          if (!playerTeam) continue;

          const isPlaying = Array.from(teamsPlaying).some(t => t.includes(playerTeam) || playerTeam.includes(t));
          if (!isPlaying) continue;

          // build inferred line from season averages when available
          const ppg = enriched.seasonAverages?.points;
          const line = ppg ? Math.round(ppg + 1) : (enriched.sofaScoreId ? 20.5 : 19.5);

          // include StatMuse reference URL when available
          const statUrl = await this.statMuseAPI.getPlayerCareerStats(name).catch(() => null);

          props.push({
            playerName: enriched.name || name,
            market: 'points',
            line,
            odds: -110,
            game: 'TBD (inferred)',
            bookmaker: 'SofaScore+StatMuse (inferred)',
            source: statUrl || 'StatMuse (query)'
          });
        } catch (e) {
          console.warn('Error building prop for', name, e.message);
        }
      }

      if (props.length > 0) {
        console.log(`✅ Built ${props.length} inferred props using SofaScore+StatMuse`);
        return props;
      }
    }

    // 2) If SofaScore+StatMuse didn't produce props, fall back to Odds API
    console.log('🔍 SofaScore/StatMuse did not yield props; checking Odds API...');
    const oddsProps = await this.oddsAPI.getPlayerProps();
    if (oddsProps && oddsProps.length > 0) {
      console.log(`✅ Got ${oddsProps.length} player props from Odds API`);
      return oddsProps;
    }

    console.log('⚠️ No live/fallback data found, using mock data');
    return this.getMockPlayerProps();
  }

  async enrichPlayerData(playerName) {
    console.log(`🔍 Enriching data for ${playerName}...`);
    
    // 1) Try BallDontLie (preferred)
    try {
      const players = await this.ballDontLieAPI.searchPlayer(playerName);
      if (players && players.length > 0) {
        const player = players[0];
        const averages = await this.ballDontLieAPI.getPlayerSeasonAverages(player.id).catch(() => null);
        if (averages) {
          console.log(`✅ Got season averages for ${playerName} from BallDontLie`);
          return {
            id: player.id,
            name: `${player.first_name} ${player.last_name}`,
            team: player.team?.full_name || null,
            position: player.position || null,
            seasonAverages: {
              points: averages.pts,
              rebounds: averages.reb,
              assists: averages.ast,
              gamesPlayed: averages.games_played
            }
          };
        }
      }
    } catch (e) {
      console.warn('BallDontLie lookup failed for', playerName, e.message);
    }

    // 2) Fallback to SofaScore: try to get player entity and some basic info
    try {
      const sofaPlayer = await this.sofaScoreAPI.getPlayerByName(playerName).catch(() => null);
      if (sofaPlayer) {
        // SofaScore entity shape may vary; map best-effort
        const name = sofaPlayer.name || `${sofaPlayer.firstName || ''} ${sofaPlayer.lastName || ''}`.trim() || playerName;
        const team = sofaPlayer.team?.name || sofaPlayer.team || null;
        const position = sofaPlayer.position || null;
        console.log(`✅ Got basic player info for ${playerName} from SofaScore`);
        return {
          id: sofaPlayer.id || null,
          name,
          team,
          position,
          seasonAverages: null
        };
      }
    } catch (e) {
      console.warn('SofaScore lookup failed for', playerName, e.message);
    }

    // 3) Nothing found
    return null;
  }

  async getTodaysGames() {
    console.log('🔍 Fetching today\'s games...');
    
    // Try SofaScore first (most detailed for live data)
    let games = await this.sofaScoreAPI.getTodaysNBAGames();
    
    if (games && games.length > 0) {
      console.log(`✅ Got ${games.length} games from SofaScore`);
      return games;
    }
    
    // Fallback to NBA API
    games = await this.nbaAPI.getTodaysGames();
    
    if (games && games.length > 0) {
      console.log(`✅ Got ${games.length} games from NBA API`);
      return games;
    }
    
    // Last fallback: BallDontLie
    games = await this.ballDontLieAPI.getTodaysGames();
    
    if (games && games.length > 0) {
      console.log(`✅ Got ${games.length} games from BallDontLie`);
      return games;
    }
    
    console.log('⚠️ No games found today');
    return [];
  }

  async getLiveScores() {
    console.log('🔴 Fetching live scores...');
    
    const liveGames = await this.sofaScoreAPI.getLiveScores();
    
    if (liveGames && liveGames.length > 0) {
      console.log(`✅ ${liveGames.length} games currently live`);
      return liveGames;
    }
    
    console.log('⚠️ No live games right now');
    return [];
  }

  async getTeamForm(teamName) {
    console.log(`📊 Fetching form for ${teamName}...`);
    
    // This requires knowing the SofaScore team ID
    // You'd need to search for the team first
    return null;
  }

  async getInjuryReport() {
    console.log('🏥 Fetching injury report...');
    
    const injuries = await this.sofaScoreAPI.getInjuryReport();
    
    if (injuries && injuries.length > 0) {
      console.log(`⚠️ ${injuries.length} players unavailable`);
      return injuries;
    }
    
    return [];
  }

  async queryStatMuse(question) {
    console.log(`💭 StatMuse query: "${question}"`);
    return await this.statMuseAPI.query(question);
  }

  // Aggregate info from all sources for a single player
  async aggregatePlayerInfo(playerName) {
    const TrendAnalyzer = require('../../core/signals/TrendAnalyzer');
    const Player = require('../models/Player');
    
    const trendAnalyzer = new TrendAnalyzer();
    const result = { playerName, sources: {}, confidence: 0 };

    try {
      // BallDontLie enrichment - GET REAL GAME DATA
      const bd = await this.enrichPlayerData(playerName).catch(() => null);
      if (bd) {
        result.sources.ballDontLie = bd;
        result.team = bd.team || result.team;
        result.seasonAverages = bd.seasonAverages || result.seasonAverages;
      }

      // SofaScore lookup
      const sofa = await this.sofaScoreAPI.getPlayerByName(playerName).catch(() => null);
      if (sofa) {
        result.sources.sofaScore = sofa;
        result.sofaScoreId = sofa.id || null;
      }

      // SofaScore stats if ID available
      if (result.sofaScoreId) {
        const sStats = await this.sofaScoreAPI.getPlayerStats(result.sofaScoreId).catch(() => null);
        if (sStats) {
          result.sources.sofaStats = sStats;
        }
      }

      // StatMuse reference
      const smUrl = await this.statMuseAPI.getPlayerCareerStats(playerName).catch(() => null);
      if (smUrl) {
        result.sources.statMuse = { url: smUrl };
      }

      // Odds API matching
      const odds = await this.oddsAPI.getPlayerProps().catch(() => null);
      if (odds && Array.isArray(odds)) {
        const match = odds.find(p => (p.playerName || '').toLowerCase().includes(playerName.split(' ')[0].toLowerCase()));
        if (match) {
          result.sources.odds = match;
          result.playingToday = true;
        }
      }

      // ✨ CALCULATE REAL CONFIDENCE using TrendAnalyzer
      if (bd && bd.recentGames && bd.recentGames.length >= 5) {
        // Create a Player object with recent games
        const player = new Player({
          id: playerName.toLowerCase().replace(/\s+/g, '_'),
          name: playerName,
          team: bd.team,
          recentGames: bd.recentGames
        });

        // Get the line (from odds API or estimate)
        const line = result.sources.odds?.line || (bd.seasonAverages?.points ? bd.seasonAverages.points + 1 : 20.5);

        // Use TrendAnalyzer to calculate REAL confidence
        const trend = trendAnalyzer.analyzePlayerTrend(player, 'points', line, 'last_10');
        
        // Use the calculated confidence!
        result.confidence = Math.round(trend.confidence);
        result.trendData = {
          hitCount: trend.hitCount,
          windowSize: trend.windowSize,
          average: trend.average,
          variance: trend.variance,
          color: trend.color
        };
        
        console.log(`📊 ${playerName}: ${result.confidence}% confidence (${trend.hitCount}/${trend.windowSize} games ${trend.color})`);
      } else {
        // Fallback: If we don't have game data, use a base confidence
        result.confidence = 50;
        console.log(`⚠️ ${playerName}: Using fallback confidence (no game data)`);
      }

    } catch (err) {
      console.warn('aggregatePlayerInfo error for', playerName, err.message);
      result.confidence = 50;
      return result;
    }

    return result;
  }

  // Generate a parlay of top players based on aggregated data
  async generateParlay({ legs = 3, mode = 'normal' } = {}) {
    const candidates = new Set();

    // 1) Try to collect from Odds API
    try {
      const odds = await this.oddsAPI.getPlayerProps().catch(() => null);
      if (odds && Array.isArray(odds)) odds.forEach(p => { if (p.playerName) candidates.add(p.playerName); });
    } catch (e) {}

    // 2) Add fallback high-profile players
    ['Stephen Curry', 'LeBron James', 'Giannis Antetokounmpo', 'Kevin Durant', 'Luka Doncic'].forEach(n => candidates.add(n));

    // 3) If SofaScore has today's games, try to infer star player names via StatMuse leaders (best-effort)
    const aggregated = [];
    for (const name of Array.from(candidates)) {
      const agg = await this.aggregatePlayerInfo(name).catch(() => null);
      if (agg) aggregated.push(agg);
    }

    // Rank by confidence and playingToday preference
    aggregated.sort((a, b) => {
      const pa = (a.playingToday ? 1 : 0) * 1000 + a.confidence;
      const pb = (b.playingToday ? 1 : 0) * 1000 + b.confidence;
      return pb - pa;
    });

    const picks = [];
    for (const item of aggregated.slice(0, legs)) {
      const ppg = item.seasonAverages?.points || null;
      const oddsSource = item.sources.odds;
      const line = oddsSource?.line || (ppg ? Math.round(ppg + 1) : 20.5);
      picks.push({
        playerName: item.playerName,
        market: 'points',
        line,
        odds: oddsSource?.odds || -110,
        confidence: item.confidence,
        playingToday: item.playingToday || false,
        sources: item.sources
      });
    }

    // persist
    try {
      const meta = { legs, mode, generatedAt: new Date().toISOString() };
      await this.saveParlay(picks, meta);
    } catch (e) {
      console.warn('Failed to save generated parlay:', e.message);
    }

    return picks;
  }

  async saveParlay(picks, meta = {}) {
    const fs = require('fs');
    const path = require('path');
    const constants = require('../../config/constants');
    const projectRoot = path.resolve(__dirname, '../../..');
    const dir = path.join(projectRoot, constants.DATA_DIR || 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = path.join(projectRoot, constants.PARLAYS_FILE || 'data/parlays.json');
    let raw = null;
    try { raw = fs.readFileSync(file, 'utf8') || ''; } catch (e) { raw = ''; }
    let parsed = null;
    try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }

    const entry = { id: `parlay_${Date.now()}`, timestamp: new Date().toISOString(), meta, picks };

    // Legacy file format was an array of parlays. If we detect that, append to it.
    if (Array.isArray(parsed)) {
      parsed.push(entry);
      fs.writeFileSync(file, JSON.stringify(parsed, null, 2));
      return entry;
    }

    // Normalize to object shape with `parlays` and `slips` arrays.
    const container = parsed && typeof parsed === 'object' ? parsed : {};
    container.parlays = Array.isArray(container.parlays) ? container.parlays : [];
    container.slips = Array.isArray(container.slips) ? container.slips : [];

    // Add the generated parlay to both parlays and slips so it appears in history/grading flows.
    container.parlays.push(entry);
    container.slips.push(entry);

    fs.writeFileSync(file, JSON.stringify(container, null, 2));
    return entry;
  }

  getMockPlayerProps() {
    return [
      {
        playerName: 'Stephen Curry',
        market: 'points',
        line: 28.5,
        odds: -110,
        game: 'Golden State Warriors vs Los Angeles Lakers',
        bookmaker: 'Mock Data'
      },
      {
        playerName: 'LeBron James',
        market: 'points',
        line: 25.5,
        odds: -115,
        game: 'Los Angeles Lakers vs Golden State Warriors',
        bookmaker: 'Mock Data'
      },
      {
        playerName: 'Giannis Antetokounmpo',
        market: 'points',
        line: 34.5,
        odds: -120,
        game: 'Milwaukee Bucks vs Brooklyn Nets',
        bookmaker: 'Mock Data'
      }
    ];
  }
}

module.exports = DataManager;

