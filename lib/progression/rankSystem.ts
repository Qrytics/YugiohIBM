/**
 * Rank System - MMR-based ranking
 *
 * Ranks:
 * - Bronze: 0-999 MMR
 * - Silver: 1000-1499 MMR
 * - Gold: 1500-1999 MMR
 * - Platinum: 2000-2499 MMR
 * - Diamond: 2500-2999 MMR
 * - Master: 3000-3499 MMR
 * - Grandmaster: 3500+ MMR
 */

export interface Rank {
  name: string;
  displayName: string;
  minMMR: number;
  maxMMR: number;
  icon: string;
}

const RANKS: Rank[] = [
  { name: 'bronze', displayName: 'Bronze', minMMR: 0, maxMMR: 999, icon: '🥉' },
  { name: 'silver', displayName: 'Silver', minMMR: 1000, maxMMR: 1499, icon: '🥈' },
  { name: 'gold', displayName: 'Gold', minMMR: 1500, maxMMR: 1999, icon: '🥇' },
  { name: 'platinum', displayName: 'Platinum', minMMR: 2000, maxMMR: 2499, icon: '💎' },
  { name: 'diamond', displayName: 'Diamond', minMMR: 2500, maxMMR: 2999, icon: '💠' },
  { name: 'master', displayName: 'Master', minMMR: 3000, maxMMR: 3499, icon: '👑' },
  { name: 'grandmaster', displayName: 'Grandmaster', minMMR: 3500, maxMMR: Infinity, icon: '⚡' },
];

export function getRankFromMMR(mmr: number): Rank {
  for (const rank of RANKS) {
    if (mmr >= rank.minMMR && mmr <= rank.maxMMR) {
      return rank;
    }
  }
  return RANKS[0]; // Default to Bronze
}

export function getProgressToNextRank(mmr: number): {
  currentRank: Rank;
  nextRank: Rank | null;
  progressMMR: number;
  percent: number;
} {
  const currentRank = getRankFromMMR(mmr);
  const currentIndex = RANKS.indexOf(currentRank);
  const nextRank = currentIndex < RANKS.length - 1 ? RANKS[currentIndex + 1] : null;

  if (!nextRank) {
    // At max rank
    return {
      currentRank,
      nextRank: null,
      progressMMR: 0,
      percent: 100,
    };
  }

  const progressMMR = mmr - currentRank.minMMR;
  const requiredMMR = nextRank.minMMR - currentRank.minMMR;
  const percent = Math.min(100, Math.max(0, (progressMMR / requiredMMR) * 100));

  return {
    currentRank,
    nextRank,
    progressMMR,
    percent,
  };
}
