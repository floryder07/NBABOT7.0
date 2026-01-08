// Jest tests for pickClassifier
// Place at NBABot/nbabot/test/pickClassifier.test.js
const { classifyPick } = require('../src/lib/pickClassifier');

describe('pickClassifier', () => {
  test('global bad pick is rejected (2/5)', () => {
    const r = classifyPick({ hits: 2, games: 5, window: 5, odds: 120 }, 'normal');
    expect(r.label).toBe('REJECT');
    expect(r.reason).toMatch(/Global bad/);
  });

  test('safe pick at 9/10 is SAFE (safe mode)', () => {
    const r = classifyPick({ hits: 9, games: 10, window: 10, odds: -110 }, 'safe');
    expect(r.label).toBe('SAFE');
  });

  test('normal mode produces NORMAL for 7/10', () => {
    const r = classifyPick({ hits: 7, games: 10, window: 10, odds: -110 }, 'normal');
    expect(r.label).toBe('NORMAL');
  });

  test('moonshot eligible when 3/5 and odds >= +100', () => {
    const r = classifyPick({ hits: 3, games: 5, window: 5, odds: '+125' }, 'moonshot');
    expect(r.label).toBe('MOONSHOT');
  });

  test('moonshot rejected when hits below threshold', () => {
    const r = classifyPick({ hits: 2, games: 5, window: 5, odds: '+180' }, 'moonshot');
    expect(r.label).not.toBe('MOONSHOT');
  });
});