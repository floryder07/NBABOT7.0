class Pick {
  constructor(data) {
    this.id = data.id || `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.player = data.player;
    this.market = data.market;
    this.line = data.line;
    this.direction = data.direction || 'over';
    this.confidence = data.confidence;
    this.confidenceColor = data.confidenceColor;
    this.mode = data.mode;
    this.explanation = data.explanation;
    this.trendCount = data.trendCount;
    this.trendWindow = data.trendWindow;
    this.odds = data.odds;
    this.risk = data.risk;
    this.timestamp = new Date();
  }

  generateId() {
    return `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toString() {
    return `${this.player.name} ${this.direction} ${this.line} ${this.market}`;
  }
}

module.exports = Pick;
