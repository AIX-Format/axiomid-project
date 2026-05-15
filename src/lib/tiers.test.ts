import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTier, getLevelProgress, getNextLevelXP, TIERS } from './tiers.ts';

test('Tiers Utility', async (t) => {
  await t.test('calculateTier', (t) => {
    assert.strictEqual(calculateTier(0), 'Ghost');
    assert.strictEqual(calculateTier(50), 'Ghost');
    assert.strictEqual(calculateTier(99), 'Ghost');

    assert.strictEqual(calculateTier(100), 'Spark');
    assert.strictEqual(calculateTier(300), 'Spark');
    assert.strictEqual(calculateTier(499), 'Spark');

    assert.strictEqual(calculateTier(500), 'Pulse');
    assert.strictEqual(calculateTier(750), 'Pulse');
    assert.strictEqual(calculateTier(999), 'Pulse');

    assert.strictEqual(calculateTier(1000), 'Axiom');
    assert.strictEqual(calculateTier(1500), 'Axiom');

    assert.strictEqual(calculateTier(-10), 'Ghost');
  });

  await t.test('getLevelProgress', (t) => {
    // Ghost tier (0-100 XP)
    assert.strictEqual(getLevelProgress(0, 'Ghost'), 0);
    assert.strictEqual(getLevelProgress(50, 'Ghost'), 50);
    assert.strictEqual(getLevelProgress(100, 'Ghost'), 100);

    // Spark tier (100-500 XP)
    assert.strictEqual(getLevelProgress(100, 'Spark'), 0);
    assert.strictEqual(getLevelProgress(300, 'Spark'), 50);
    assert.strictEqual(getLevelProgress(500, 'Spark'), 100);

    // Pulse tier (500-1000 XP)
    assert.strictEqual(getLevelProgress(500, 'Pulse'), 0);
    assert.strictEqual(getLevelProgress(750, 'Pulse'), 50);
    assert.strictEqual(getLevelProgress(1000, 'Pulse'), 100);

    // Axiom tier
    assert.strictEqual(getLevelProgress(1000, 'Axiom'), 100);
    assert.strictEqual(getLevelProgress(1500, 'Axiom'), 100);

    // Clamping
    assert.strictEqual(getLevelProgress(-10, 'Ghost'), 0);
    assert.strictEqual(getLevelProgress(150, 'Ghost'), 100);
    assert.strictEqual(getLevelProgress(50, 'Spark'), 0);
    assert.strictEqual(getLevelProgress(600, 'Spark'), 100);
  });

  await t.test('getNextLevelXP', (t) => {
    assert.strictEqual(getNextLevelXP('Ghost'), TIERS.Spark);
    assert.strictEqual(getNextLevelXP('Spark'), TIERS.Pulse);
    assert.strictEqual(getNextLevelXP('Pulse'), TIERS.Axiom);
    assert.strictEqual(getNextLevelXP('Axiom'), null);
  });
});
