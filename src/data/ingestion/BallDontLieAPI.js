const axios = require('axios');

class BallDontLieAPI {
  constructor() {
    this.baseUrl = 'https://www.balldontlie.io/api/v1';
  }

  async searchPlayer(name) {
    try {
      const response = await axios.get(`${this.baseUrl}/players`, {
        params: { search: name }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ BallDontLie API Error:', error.message);
      return null;
    }
  }

  async getPlayerSeasonAverages(playerId, season = 2024) {
    try {
      const response = await axios.get(`${this.baseUrl}/season_averages`, {
        params: { 
          season: season,
          player_ids: [playerId]
        }
      });
      
      return response.data.data[0];
    } catch (error) {
      console.error('❌ BallDontLie API Error:', error.message);
      return null;
    }
  }

  async getPlayerGameStats(playerId, startDate, endDate) {
    try {
      const response = await axios.get(`${this.baseUrl}/stats`, {
        params: {
          player_ids: [playerId],
          start_date: startDate,
          end_date: endDate,
          per_page: 100
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ BallDontLie API Error:', error.message);
      return null;
    }
  }

  async getTodaysGames() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${this.baseUrl}/games`, {
        params: { dates: [today] }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ BallDontLie API Error:', error.message);
      return null;
    }
  }
}

module.exports = BallDontLieAPI;
