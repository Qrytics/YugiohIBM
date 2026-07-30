/**
 * Level System
 *
 * XP Progression: Level * 100 XP required per level
 * Example:
 * - Level 1 → 2: 100 XP
 * - Level 2 → 3: 200 XP
 * - Level 3 → 4: 300 XP
 * - Level 10 → 11: 1000 XP
 *
 * Max Level: 50
 */

export const MAX_LEVEL = 50;

/**
 * Get XP required to reach a specific level
 * @param level Target level (2-50)
 * @returns Total XP required from level 1
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > MAX_LEVEL) return getXPForLevel(MAX_LEVEL);

  // Sum of 100 + 200 + 300 + ... + (level-1)*100
  // Formula: n(n+1)/2 * 100 where n = level - 1
  const n = level - 1;
  return (n * (n + 1) / 2) * 100;
}

/**
 * Calculate level from total XP
 * @param xp Total XP accumulated
 * @returns Current level (1-50)
 */
export function getLevelFromXP(xp: number): number {
  if (xp < 0) return 1;

  for (let level = 1; level <= MAX_LEVEL; level++) {
    const xpForNextLevel = getXPForLevel(level + 1);
    if (xp < xpForNextLevel) {
      return level;
    }
  }

  return MAX_LEVEL;
}

/**
 * Get XP progress toward next level
 * @param xp Current total XP
 * @returns Progress information
 */
export function getProgressToNextLevel(xp: number): {
  currentLevel: number;
  nextLevel: number;
  currentXP: number;
  requiredXP: number;
  progressXP: number;
  percent: number;
} {
  const currentLevel = getLevelFromXP(xp);
  const nextLevel = Math.min(currentLevel + 1, MAX_LEVEL);

  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(nextLevel);

  const requiredXP = nextLevelXP - currentLevelXP;
  const progressXP = xp - currentLevelXP;
  const percent = requiredXP > 0 ? (progressXP / requiredXP) * 100 : 100;

  return {
    currentLevel,
    nextLevel,
    currentXP: xp,
    requiredXP,
    progressXP,
    percent: Math.min(100, Math.max(0, percent)),
  };
}

/**
 * Get XP needed for next level
 * @param xp Current total XP
 * @returns XP required to reach next level
 */
export function getXPToNextLevel(xp: number): number {
  const currentLevel = getLevelFromXP(xp);
  if (currentLevel >= MAX_LEVEL) return 0;

  const nextLevelXP = getXPForLevel(currentLevel + 1);
  return nextLevelXP - xp;
}

/**
 * Check if XP gain causes level up
 * @param oldXP Previous XP total
 * @param newXP New XP total
 * @returns Array of levels gained (e.g., [2, 3] if leveled from 1 to 3)
 */
export function checkLevelUp(oldXP: number, newXP: number): number[] {
  const oldLevel = getLevelFromXP(oldXP);
  const newLevel = getLevelFromXP(newXP);

  if (newLevel <= oldLevel) return [];

  const levelsGained: number[] = [];
  for (let level = oldLevel + 1; level <= newLevel; level++) {
    levelsGained.push(level);
  }

  return levelsGained;
}
