module.exports = {
  PLAYER_MARKETS: {
    points: { name: 'Points', abbreviation: 'PTS', statKey: 'points' },
    rebounds: { name: 'Rebounds', abbreviation: 'REB', statKey: 'rebounds' },
    assists: { name: 'Assists', abbreviation: 'AST', statKey: 'assists' },
    threes: { name: '3-Pointers', abbreviation: '3PM', statKey: 'threesMade' }
  },
  TREND_WINDOWS: {
    last_5: { name: 'Last 5 Games', games: 5 },
    last_10: { name: 'Last 10 Games', games: 10 },
    last_15: { name: 'Last 15 Games', games: 15 }
  }
};
