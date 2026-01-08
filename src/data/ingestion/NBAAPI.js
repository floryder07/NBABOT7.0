const axios = require('axios');

class NBAAPI {
  constructor() {
    this.apiKey = process.env.NBA_API_KEY;
    this.baseUrl = 'https://v2.nba.api-sports.io';
  }

  async getTodaysGames() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${this.baseUrl}/games`, {
        params: { date: today },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'v2.nba.api-sports.io'
        }
      });
      
      return response.data.response;
    } catch (error) {
      console.error('❌ NBA API Error:', error.message);
      return null;
    }
  }

  async getPlayerStats(playerId, season = '2024') {
    try {
      const response = await axios.get(`${this.baseUrl}/players/statistics`, {
        params: { 
          id: playerId,
          season: season
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'v2.nba.api-sports.io'
        }
      });
      
      return response.data.response;
    } catch (error) {
      console.error('❌ NBA API Error:', error.message);
      return null;
    }
  }

  async getTeamStats(teamId, season = '2024') {
    try {
      const response = await axios.get(`${this.baseUrl}/teams/statistics`, {
        params: { 
          id: teamId,
          season: season
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'v2.nba.api-sports.io'
        }
      });
      
      return response.data.response;
    } catch (error) {
      console.error('❌ NBA API Error:', error.message);
      return null;
    }
  }

  async getLiveGames() {
    try {
      const response = await axios.get(`${this.baseUrl}/games`, {
        params: { live: 'all' },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'v2.nba.api-sports.io'
        }
      });
      
      return response.data.response;
    } catch (error) {
      console.error('❌ NBA API Error:', error.message);
      return null;
    }
  }
}

module.exports = NBAAPI;
