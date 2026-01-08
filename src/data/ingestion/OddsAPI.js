const axios = require('axios');

class OddsAPI {
  constructor() {
    this.apiKey = process.env.ODDS_API_KEY;
    this.baseUrl = 'https://api.the-odds-api.com/v4';
  }

  async getPlayerProps() {
    if (!this.apiKey) return null;
    try {
      const response = await axios.get(`${this.baseUrl}/sports/basketball_nba/events`, {
        params: {
          apiKey: this.apiKey,
          markets: 'player_points,player_rebounds,player_assists',
          regions: 'us',
          oddsFormat: 'american'
        }
      });

      const remaining = response.headers && response.headers['x-requests-remaining'];
      if (remaining) console.log(`📊 Odds API: ${remaining} requests remaining`);
      return this.parsePlayerProps(response.data);
    } catch (error) {
      console.error('❌ Odds API Error:', error.message);
      return null;
    }
  }

  parsePlayerProps(data) {
    const props = [];
    if (!Array.isArray(data)) return props;

    data.forEach(game => {
      if (!game.bookmakers || game.bookmakers.length === 0) return;
      const bookmaker = game.bookmakers[0];
      (bookmaker.markets || []).forEach(market => {
        (market.outcomes || []).forEach(outcome => {
          props.push({
            playerName: outcome.description,
            market: (market.key || '').replace('player_', ''),
            line: outcome.point,
            odds: outcome.price,
            game: `${game.home_team} vs ${game.away_team}`,
            gameTime: game.commence_time,
            bookmaker: bookmaker.title
          });
        });
      });
    });

    return props;
  }

  async getGameOdds() {
    if (!this.apiKey) return null;
    try {
      const response = await axios.get(`${this.baseUrl}/sports/basketball_nba/odds`, {
        params: {
          apiKey: this.apiKey,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american'
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Odds API Error:', error.message);
      return null;
    }
  }
}

module.exports = OddsAPI;
