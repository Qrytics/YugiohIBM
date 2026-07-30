/**
 * Level Rewards
 *
 * Rewards awarded when player reaches certain levels
 */

export type RewardType = 'pack' | 'xp' | 'cosmetic';

export interface Reward {
  type: RewardType;
  packType?: 'standard' | 'rare' | 'epic';
  quantity?: number;
  amount?: number;
  cosmeticId?: string;
}

/**
 * Level reward table
 * Players receive these rewards when reaching the specified level
 */
export const LEVEL_REWARDS: Record<number, Reward[]> = {
  2: [{ type: 'pack', packType: 'standard', quantity: 1 }],
  3: [{ type: 'pack', packType: 'standard', quantity: 1 }],
  4: [{ type: 'pack', packType: 'standard', quantity: 1 }],
  5: [{ type: 'pack', packType: 'rare', quantity: 1 }],
  6: [{ type: 'pack', packType: 'standard', quantity: 1 }],
  7: [{ type: 'pack', packType: 'standard', quantity: 1 }],
  8: [{ type: 'pack', packType: 'standard', quantity: 1 }],
  9: [{ type: 'pack', packType: 'standard', quantity: 1 }],
  10: [{ type: 'pack', packType: 'rare', quantity: 2 }],
  15: [{ type: 'pack', packType: 'rare', quantity: 2 }],
  20: [{ type: 'pack', packType: 'epic', quantity: 1 }],
  25: [{ type: 'pack', packType: 'rare', quantity: 3 }],
  30: [{ type: 'pack', packType: 'epic', quantity: 2 }],
  35: [{ type: 'pack', packType: 'rare', quantity: 3 }],
  40: [{ type: 'pack', packType: 'epic', quantity: 3 }],
  45: [{ type: 'pack', packType: 'epic', quantity: 3 }],
  50: [{ type: 'pack', packType: 'epic', quantity: 5 }],
};

/**
 * Get rewards for a specific level
 */
export function getRewardsForLevel(level: number): Reward[] {
  return LEVEL_REWARDS[level] || [];
}

/**
 * Check if level has rewards
 */
export function hasRewards(level: number): boolean {
  return level in LEVEL_REWARDS;
}

/**
 * Get all reward levels
 */
export function getAllRewardLevels(): number[] {
  return Object.keys(LEVEL_REWARDS).map(Number).sort((a, b) => a - b);
}

/**
 * Get next reward level
 */
export function getNextRewardLevel(currentLevel: number): number | null {
  const rewardLevels = getAllRewardLevels();
  return rewardLevels.find(level => level > currentLevel) || null;
}
