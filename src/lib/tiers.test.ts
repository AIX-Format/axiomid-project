import assert from 'node:assert/strict';
import test, { describe, it } from 'node:test';
import { calculateTier, getLevelProgress, getNextLevelXP } from './tiers.ts';

describe('Tier Utilities', () => {
  it('should calculate correct tier', () => {
    assert.equal(calculateTier(0), 'Ghost');
    assert.equal(calculateTier(50), 'Ghost');
    assert.equal(calculateTier(100), 'Spark');
    assert.equal(calculateTier(499), 'Spark');
    assert.equal(calculateTier(500), 'Pulse');
    assert.equal(calculateTier(999), 'Pulse');
    assert.equal(calculateTier(1000), 'Axiom');
    assert.equal(calculateTier(5000), 'Axiom');
  });

  it('should get next level XP', () => {
    assert.equal(getNextLevelXP('Ghost'), 100);
    assert.equal(getNextLevelXP('Spark'), 500);
    assert.equal(getNextLevelXP('Pulse'), 1000);
    assert.equal(getNextLevelXP('Axiom'), null);
  });

  it('should calculate level progress', () => {
    assert.equal(getLevelProgress(0, 'Ghost'), 0);
    assert.equal(getLevelProgress(50, 'Ghost'), 50);
    assert.equal(getLevelProgress(100, 'Ghost'), 100);

    assert.equal(getLevelProgress(100, 'Spark'), 0);
    assert.equal(getLevelProgress(300, 'Spark'), 50);
    assert.equal(getLevelProgress(500, 'Spark'), 100);

    assert.equal(getLevelProgress(500, 'Pulse'), 0);
    assert.equal(getLevelProgress(750, 'Pulse'), 50);
    assert.equal(getLevelProgress(1000, 'Pulse'), 100);

    assert.equal(getLevelProgress(1000, 'Axiom'), 100);
    assert.equal(getLevelProgress(2000, 'Axiom'), 100);
  });

  it('should clamp progress', () => {
    assert.equal(getLevelProgress(-10, 'Ghost'), 0);
    assert.equal(getLevelProgress(150, 'Ghost'), 100);
  });
});
