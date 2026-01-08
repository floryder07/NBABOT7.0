const axios = require('axios');

class StatMuseAPI {
  constructor() {
    // StatMuse doesn't have a public API, so we'll scrape their website
    this.baseUrl = 'https://www.statmuse.com/nba';
  }

  async query(question) {
    try {
      // Format question for URL
      const formattedQuestion = question.toLowerCase().replace(/\s+/g, '-');
      const url = `${this.baseUrl}/ask/${formattedQuestion}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      // StatMuse returns HTML, you'd need to parse it
      // For now, we'll return the URL for manual checking
      console.log(`✅ StatMuse query: ${url}`);
      return url;
    } catch (error) {
      console.error('❌ StatMuse Error:', error.message);
      return null;
    }
  }

  async getPlayerLeaders(stat = 'points', season = '2024-25') {
    try {
      // Common queries
      const queries = {
        points: 'who-leads-the-nba-in-points-per-game-this-season',
        rebounds: 'who-leads-the-nba-in-rebounds-per-game-this-season',
        assists: 'who-leads-the-nba-in-assists-per-game-this-season',
        threes: 'who-leads-the-nba-in-3-pointers-made-per-game-this-season'
      };

      const query = queries[stat] || queries.points;
      const url = `${this.baseUrl}/ask/${query}`;
      
      console.log(`📊 StatMuse Leaders: ${url}`);
      return url;
    } catch (error) {
      console.error('❌ StatMuse Leaders Error:', error.message);
      return null;
    }
  }

  async getPlayerComparison(player1, player2) {
    const query = `${player1}-vs-${player2}-stats`.toLowerCase().replace(/\s+/g, '-');
    const url = `${this.baseUrl}/ask/${query}`;
    
    console.log(`🔍 StatMuse Comparison: ${url}`);
    return url;
  }

  async getPlayerCareerStats(playerName) {
    const query = `${playerName}-career-stats`.toLowerCase().replace(/\s+/g, '-');
    const url = `${this.baseUrl}/ask/${query}`;
    
    console.log(`📈 StatMuse Career: ${url}`);
    return url;
  }

  // Helper to get trending questions
  getTrendingQueries() {
    return [
      'who-has-the-most-points-in-nba-history',
      'who-leads-the-nba-in-scoring-this-season',
      'who-has-the-most-triple-doubles-this-season',
      'which-nba-team-has-the-best-record',
      'who-won-the-last-nba-championship'
    ];
  }
}

module.exports = StatMuseAPI;
