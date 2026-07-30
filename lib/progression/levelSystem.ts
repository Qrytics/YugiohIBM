/**
 * Level System - XP thresholds and level calculations
 *
 * Formula: Level requires (level * 100) cumulative XP
 * Level 1→2: 100 XP
 * Level 2→3: 300 XP total (200 more)
 * Level 3→4: 600 XP total (300 more)
 * Max level: 50
 */

export function getLevelFromXP(xp: number): number {
  if (xp < 0) return 1;

  // Formula: cumulative XP = (level * (level + 1) / 2) * 100
  // Solve for level using quadratic formula
  for (let level = 1; level <= 50; level++) {
    const xpForNextLevel = (level * (level + 1) / 2) * 100;
    if (xp < xpForNextLevel) {
      return level;
    }
  }

  return 50; // Max level
}

export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level * (level + 1) / 2) * 100;
}

export function getProgressToNextLevel(xp: number): {
  currentLevel: number;
  nextLevel: number;
  progressXP: number;
  requiredXP: number;
  percent: number;
} {
  const currentLevel = getLevelFromXP(xp);
  const nextLevel = Math.min(currentLevel + 1, 50);

  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(nextLevel);
  const requiredXP = nextLevelXP - currentLevelXP;
  const progressXP = xp - currentLevelXP;
  const percent = Math.min(100, Math.max(0, (progressXP / requiredXP) * 100));

  return {
    currentLevel,
    nextLevel,
    progressXP,
    requiredXP,
    percent,
  };
}

export function checkLevelUp(oldXP: number, newXP: number): number[] {
  const oldLevel = getLevelFromXP(oldXP);
  const newLevel = getLevelFromXP(newXP);

  if (newLevel <= oldLevel) return [];

  // Return all levels gained
  const levelsGained = [];
  for (let level = oldLevel + 1; level <= newLevel; level++) {
    levelsGained.push(level);
  }

  return levelsGained;
}
