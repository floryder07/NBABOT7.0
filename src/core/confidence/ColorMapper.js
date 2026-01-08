const { COLORS } = require('../../config/constants');

class ColorMapper {
  getEmoji(color) {
    const map = { green: COLORS.GREEN, orange: COLORS.ORANGE, red: COLORS.RED, moonshot: COLORS.MOONSHOT };
    return map[color] || COLORS.ORANGE;
  }

  getDisplayString(color, hitCount, windowSize) {
    const emoji = this.getEmoji(color);
    return `${hitCount}/${windowSize} games ${emoji}`;
  }
}

module.exports = ColorMapper;
