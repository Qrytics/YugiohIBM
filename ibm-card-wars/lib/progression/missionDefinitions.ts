/**
 * Mission Definitions
 *
 * Templates for daily and weekly missions
 */

import { Reward } from './levelRewards';

export interface MissionTemplate {
  id: string;
  type: 'daily' | 'weekly';
  name: string;
  description: string;
  goal: number;
  rewards: Reward[];
  category: 'play' | 'win' | 'profession' | 'collection';
}

/**
 * Daily mission templates
 * 3 randomly selected each day
 */
export const DAILY_MISSIONS: MissionTemplate[] = [
  {
    id: 'daily_play_3',
    type: 'daily',
    name: 'Warm Up',
    description: 'Play 3 matches',
    goal: 3,
    rewards: [{ type: 'xp', amount: 50 }],
    category: 'play',
  },
  {
    id: 'daily_play_5',
    type: 'daily',
    name: 'Active Player',
    description: 'Play 5 matches',
    goal: 5,
    rewards: [{ type: 'pack', packType: 'standard', quantity: 1 }],
    category: 'play',
  },
  {
    id: 'daily_win_2',
    type: 'daily',
    name: 'Victory Streak',
    description: 'Win 2 matches',
    goal: 2,
    rewards: [{ type: 'xp', amount: 100 }],
    category: 'win',
  },
  {
    id: 'daily_win_3',
    type: 'daily',
    name: 'Dominant',
    description: 'Win 3 matches',
    goal: 3,
    rewards: [{ type: 'pack', packType: 'standard', quantity: 1 }],
    category: 'win',
  },
  {
    id: 'daily_play_cloud',
    type: 'daily',
    name: 'Cloud Specialist',
    description: 'Play 2 matches with a Cloud deck',
    goal: 2,
    rewards: [{ type: 'xp', amount: 75 }],
    category: 'profession',
  },
  {
    id: 'daily_play_ai',
    type: 'daily',
    name: 'AI Enthusiast',
    description: 'Play 2 matches with an AI deck',
    goal: 2,
    rewards: [{ type: 'xp', amount: 75 }],
    category: 'profession',
  },
  {
    id: 'daily_play_security',
    type: 'daily',
    name: 'Security Expert',
    description: 'Play 2 matches with a Security deck',
    goal: 2,
    rewards: [{ type: 'xp', amount: 75 }],
    category: 'profession',
  },
];

/**
 * Weekly mission templates
 * 1-2 selected each week
 */
export const WEEKLY_MISSIONS: MissionTemplate[] = [
  {
    id: 'weekly_play_20',
    type: 'weekly',
    name: 'Dedicated Player',
    description: 'Play 20 matches this week',
    goal: 20,
    rewards: [{ type: 'pack', packType: 'rare', quantity: 2 }],
    category: 'play',
  },
  {
    id: 'weekly_win_10',
    type: 'weekly',
    name: 'Champion',
    description: 'Win 10 matches this week',
    goal: 10,
    rewards: [{ type: 'pack', packType: 'rare', quantity: 3 }],
    category: 'win',
  },
  {
    id: 'weekly_play_30',
    type: 'weekly',
    name: 'Hardcore Gamer',
    description: 'Play 30 matches this week',
    goal: 30,
    rewards: [{ type: 'pack', packType: 'epic', quantity: 1 }],
    category: 'play',
  },
  {
    id: 'weekly_win_15',
    type: 'weekly',
    name: 'Unstoppable',
    description: 'Win 15 matches this week',
    goal: 15,
    rewards: [
      { type: 'pack', packType: 'rare', quantity: 2 },
      { type: 'pack', packType: 'epic', quantity: 1 },
    ],
    category: 'win',
  },
];

/**
 * Get random daily missions (3 unique)
 */
export function generateDailyMissions(): MissionTemplate[] {
  const shuffled = [...DAILY_MISSIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

/**
 * Get random weekly missions (1)
 */
export function generateWeeklyMissions(): MissionTemplate[] {
  const shuffled = [...WEEKLY_MISSIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 1);
}

/**
 * Get mission template by ID
 */
export function getMissionTemplate(missionId: string): MissionTemplate | undefined {
  return [...DAILY_MISSIONS, ...WEEKLY_MISSIONS].find(m => m.id === missionId);
}

/**
 * Calculate mission expiry time
 */
export function getMissionExpiryTime(type: 'daily' | 'weekly'): Date {
  const now = new Date();

  if (type === 'daily') {
    // Next midnight UTC
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow;
  } else {
    // Next Monday midnight UTC
    const nextMonday = new Date(now);
    const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
    nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
    nextMonday.setUTCHours(0, 0, 0, 0);
    return nextMonday;
  }
}
