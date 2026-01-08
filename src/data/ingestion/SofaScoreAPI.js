const axios = require('axios');

class SofaScoreAPI {
  constructor() {
    this.baseUrl = 'https://api.sofascore.com/api/v1';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
  }

  async getTodaysNBAGames() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(
        `${this.baseUrl}/sport/basketball/scheduled-events/${today}`,
        { headers: this.headers }
      );
      
      // Filter for NBA games
      const nbaGames = response.data.events.filter(
        event => event.tournament?.uniqueTournament?.name === 'NBA'
      );
      
      console.log(`✅ SofaScore: Found ${nbaGames.length} NBA games today`);
      return nbaGames;
    } catch (error) {
      console.error('❌ SofaScore API Error:', error.message);
      return null;
    }
  }

  async getPlayerStats(playerId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/player/${playerId}/statistics`,
        { headers: this.headers }
      );
      
      return response.data.statistics;
    } catch (error) {
      console.error('❌ SofaScore Player Stats Error:', error.message);
      return null;
    }
  }

  async getTeamForm(teamId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/team/${teamId}/events/last/0`,
        { headers: this.headers }
      );
      
      const recentGames = response.data.events.slice(0, 5);
      const wins = recentGames.filter(game => {
        const isHome = game.homeTeam.id === teamId;
        const won = isHome 
          ? game.homeScore.current > game.awayScore.current
          : game.awayScore.current > game.homeScore.current;
        return won;
      }).length;
      
      return {
        recentGames: recentGames.length,
        wins,
        losses: recentGames.length - wins,
        form: `${wins}W-${recentGames.length - wins}L`,
        percentage: (wins / recentGames.length * 100).toFixed(0)
      };
    } catch (error) {
      console.error('❌ SofaScore Team Form Error:', error.message);
      return null;
    }
  }

  async getLiveScores() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/sport/basketball/events/live`,
        { headers: this.headers }
      );
      
      const nbaGames = response.data.events.filter(
        event => event.tournament?.uniqueTournament?.name === 'NBA'
      );
      
      return nbaGames.map(game => ({
        id: game.id,
        homeTeam: game.homeTeam.name,
        awayTeam: game.awayTeam.name,
        homeScore: game.homeScore.current,
        awayScore: game.awayScore.current,
        status: game.status.description,
        period: game.status.type
      }));
    } catch (error) {
      console.error('❌ SofaScore Live Scores Error:', error.message);
      return null;
    }
  }

  async getPlayerByName(playerName) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/search/all`,
        {
          params: { q: playerName },
          headers: this.headers
        }
      );
      
      // Find NBA players in results
      const players = response.data.results.filter(
        result => result.type === 'player' && result.entity?.sport?.name === 'Basketball'
      );
      
      return players[0]?.entity || null;
    } catch (error) {
      console.error('❌ SofaScore Search Error:', error.message);
      return null;
    }
  }

  async getInjuryReport() {
    try {
      // SofaScore doesn't have a direct injury endpoint, 
      // but we can check player availability through game lineups
      const games = await this.getTodaysNBAGames();
      const injuries = [];

      for (const game of games.slice(0, 3)) { // Check first 3 games
        try {
          const lineupResponse = await axios.get(
            `${this.baseUrl}/event/${game.id}/lineups`,
            { headers: this.headers }
          );
          
          // Check for missing/injured players
          if (lineupResponse.data.unavailable) {
            lineupResponse.data.unavailable.forEach(player => {
              injuries.push({
                playerName: player.name,
                team: player.team?.name,
                reason: player.reason || 'Unavailable'
              });
            });
          }
        } catch (err) {
          // Skip if lineup not available
          continue;
        }
      }

      return injuries;
    } catch (error) {
      console.error('❌ SofaScore Injury Report Error:', error.message);
      return [];
    }
  }
}

module.exports = SofaScoreAPI;
