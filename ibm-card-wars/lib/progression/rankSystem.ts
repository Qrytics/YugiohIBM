/**
 * Rank System
 *
 * MMR-based ranking system for competitive play
 */

export type Rank =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster';

export interface RankInfo {
  rank: Rank;
  name: string;
  minMMR: number;
  maxMMR: number | null;
  color: string;
  icon: string;
}

export const RANK_THRESHOLDS: Record<Rank, RankInfo> = {
  bronze: {
    rank: 'bronze',
    name: 'Bronze',
    minMMR: 0,
    maxMMR: 999,
    color: '#CD7F32',
    icon: '🥉',
  },
  silver: {
    rank: 'silver',
    name: 'Silver',
    minMMR: 1000,
    maxMMR: 1499,
    color: '#C0C0C0',
    icon: '🥈',
  },
  gold: {
    rank: 'gold',
    name: 'Gold',
    minMMR: 1500,
    maxMMR: 1999,
    color: '#FFD700',
    icon: '🥇',
  },
  platinum: {
    rank: 'platinum',
    name: 'Platinum',
    minMMR: 2000,
    maxMMR: 2499,
    color: '#E5E4E2',
    icon: '💎',
  },
  diamond: {
    rank: 'diamond',
    name: 'Diamond',
    minMMR: 2500,
    maxMMR: 2999,
    color: '#B9F2FF',
    icon: '💠',
  },
  master: {
    rank: 'master',
    name: 'Master',
    minMMR: 3000,
    maxMMR: 3499,
    color: '#9B59B6',
    icon: '👑',
  },
  grandmaster: {
    rank: 'grandmaster',
    name: 'Grandmaster',
    minMMR: 3500,
    maxMMR: null,
    color: '#FF6B6B',
    icon: '⭐',
  },
};

/**
 * Get rank from MMR
 */
export function getRankFromMMR(mmr: number): Rank {
  if (mmr >= 3500) return 'grandmaster';
  if (mmr >= 3000) return 'master';
  if (mmr >= 2500) return 'diamond';
  if (mmr >= 2000) return 'platinum';
  if (mmr >= 1500) return 'gold';
  if (mmr >= 1000) return 'silver';
  return 'bronze';
}

/**
 * Get rank info
 */
export function getRankInfo(rank: Rank): RankInfo {
  return RANK_THRESHOLDS[rank];
}

/**
 * Get MMR required for next rank
 */
export function getNextRankThreshold(mmr: number): number | null {
  const currentRank = getRankFromMMR(mmr);
  const rankOrder: Rank[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];
  const currentIndex = rankOrder.indexOf(currentRank);

  if (currentIndex === rankOrder.length - 1) return null; // Already grandmaster

  const nextRank = rankOrder[currentIndex + 1];
  return RANK_THRESHOLDS[nextRank].minMMR;
}

/**
 * Get progress to next rank
 */
export function getProgressToNextRank(mmr: number): {
  currentRank: Rank;
  nextRank: Rank | null;
  currentMMR: number;
  requiredMMR: number | null;
  progressMMR: number;
  percent: number;
} {
  const currentRank = getRankFromMMR(mmr);
  const currentRankInfo = RANK_THRESHOLDS[currentRank];
  const nextThreshold = getNextRankThreshold(mmr);

  if (nextThreshold === null) {
    return {
      currentRank,
      nextRank: null,
      currentMMR: mmr,
      requiredMMR: null,
      progressMMR: 0,
      percent: 100,
    };
  }

  const rankOrder: Rank[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];
  const currentIndex = rankOrder.indexOf(currentRank);
  const nextRank = rankOrder[currentIndex + 1];

  const requiredMMR = nextThreshold - currentRankInfo.minMMR;
  const progressMMR = mmr - currentRankInfo.minMMR;
  const percent = (progressMMR / requiredMMR) * 100;

  return {
    currentRank,
    nextRank,
    currentMMR: mmr,
    requiredMMR,
    progressMMR,
    percent: Math.min(100, Math.max(0, percent)),
  };
}

/**
 * Check if MMR change causes rank promotion/demotion
 */
export function checkRankChange(oldMMR: number, newMMR: number): {
  promoted: boolean;
  demoted: boolean;
  oldRank: Rank;
  newRank: Rank;
} {
  const oldRank = getRankFromMMR(oldMMR);
  const newRank = getRankFromMMR(newMMR);

  return {
    promoted: newRank !== oldRank && rankOrder(newRank) > rankOrder(oldRank),
    demoted: newRank !== oldRank && rankOrder(newRank) < rankOrder(oldRank),
    oldRank,
    newRank,
  };
}

function rankOrder(rank: Rank): number {
  const order: Rank[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];
  return order.indexOf(rank);
}
