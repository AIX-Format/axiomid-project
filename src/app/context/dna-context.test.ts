import { calculateTier, getNextLevelXP, getLevelProgress, TIERS } from '@/lib/tiers';

describe('Tier Logic Helpers (formerly DNA Context)', () => {
    describe('calculateTier', () => {
        it('should return "Ghost" for XP below spark threshold', () => {
            expect(calculateTier(0)).toBe('Ghost');
            expect(calculateTier(50)).toBe('Ghost');
            expect(calculateTier(99)).toBe('Ghost');
        });

        it('should return "Spark" for XP between spark and pulse thresholds', () => {
            expect(calculateTier(100)).toBe('Spark');
            expect(calculateTier(300)).toBe('Spark');
            expect(calculateTier(499)).toBe('Spark');
        });

        it('should return "Pulse" for XP between pulse and axiom thresholds', () => {
            expect(calculateTier(500)).toBe('Pulse');
            expect(calculateTier(750)).toBe('Pulse');
            expect(calculateTier(999)).toBe('Pulse');
        });

        it('should return "Axiom" for XP at or above axiom threshold', () => {
            expect(calculateTier(1000)).toBe('Axiom');
            expect(calculateTier(1500)).toBe('Axiom');
        });
    });

    describe('getNextLevelXP', () => {
        it('should return spark threshold for ghost tier', () => {
            expect(getNextLevelXP('Ghost')).toBe(TIERS.Spark);
        });

        it('should return pulse threshold for spark tier', () => {
            expect(getNextLevelXP('Spark')).toBe(TIERS.Pulse);
        });

        it('should return axiom threshold for pulse tier', () => {
            expect(getNextLevelXP('Pulse')).toBe(TIERS.Axiom);
        });

        it('should return null for axiom tier', () => {
            expect(getNextLevelXP('Axiom')).toBeNull();
        });
    });

    describe('getLevelProgress', () => {
        it('should calculate correct progress for ghost tier', () => {
            expect(getLevelProgress(0, 'Ghost')).toBe(0);
            expect(getLevelProgress(50, 'Ghost')).toBe(50);
            expect(getLevelProgress(100, 'Ghost')).toBe(100);
        });

        it('should calculate correct progress for spark tier', () => {
            expect(getLevelProgress(100, 'Spark')).toBe(0);
            expect(getLevelProgress(300, 'Spark')).toBe(50);
            expect(getLevelProgress(500, 'Spark')).toBe(100);
        });

        it('should calculate correct progress for pulse tier', () => {
            expect(getLevelProgress(500, 'Pulse')).toBe(0);
            expect(getLevelProgress(750, 'Pulse')).toBe(50);
            expect(getLevelProgress(1000, 'Pulse')).toBe(100);
        });

        it('should always return 100% for axiom tier', () => {
            expect(getLevelProgress(1000, 'Axiom')).toBe(100);
            expect(getLevelProgress(1500, 'Axiom')).toBe(100);
        });
    });
});
