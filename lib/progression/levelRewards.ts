/**
 * Level Rewards - Packs awarded on level-up
 */

export interface Reward {
  type: 'pack' | 'xp';
  packType?: 'standard' | 'rare' | 'epic';
  quantity?: number;
  amount?: number;
}

const LEVEL_REWARDS: Record<number, Reward[]> = {
  2: [{ type: 'pack', packType: 'standard', quantity: 1 }],
  3: [{ type: 'pack', packType: 'standard', quantity: 1 }],
  4: [{ type: 'pack', packType: 'standard', quantity: 1 }],
  5: [{ type: 'pack', packType: 'rare', quantity: 1 }],
  10: [{ type: 'pack', packType: 'rare', quantity: 2 }],
  15: [{ type: 'pack', packType: 'rare', quantity: 2 }],
  20: [{ type: 'pack', packType: 'epic', quantity: 1 }],
  25: [{ type: 'pack', packType: 'rare', quantity: 3 }],
  30: [{ type: 'pack', packType: 'epic', quantity: 2 }],
  40: [{ type: 'pack', packType: 'epic', quantity: 3 }],
  50: [{ type: 'pack', packType: 'epic', quantity: 5 }],
};

export function getRewardsForLevel(level: number): Reward[] {
  return LEVEL_REWARDS[level] || [];
}

export function hasRewardsForLevel(level: number): boolean {
  return level in LEVEL_REWARDS;
}
