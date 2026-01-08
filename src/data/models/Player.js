class Player {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.team = data.team;
    this.position = data.position;
    this.recentGames = data.recentGames || [];
  }

  getAverageStat(stat, window = 10) {
    const games = this.recentGames.slice(0, window);
    if (games.length === 0) return 0;
    const total = games.reduce((sum, game) => sum + (game[stat] || 0), 0);
    return total / games.length;
  }

  getTrendCount(stat, threshold, window = 10) {
    const games = this.recentGames.slice(0, window);
    return games.filter(game => (game[stat] || 0) >= threshold).length;
  }

  getVariance(stat, window = 10) {
    const games = this.recentGames.slice(0, window);
    if (games.length < 2) return 0;
    const values = games.map(game => game[stat] || 0);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

module.exports = Player;
