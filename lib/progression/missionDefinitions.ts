/**
 * Mission Definitions - Daily and weekly mission templates
 */

import { Reward } from './levelRewards';

export interface MissionTemplate {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly';
  goal: number;
  rewards: Reward[];
}

const DAILY_MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: 'daily_play_3',
    name: 'Play 3 Games',
    description: 'Complete 3 matches in any mode',
    type: 'daily',
    goal: 3,
    rewards: [{ type: 'pack', packType: 'standard', quantity: 1 }],
  },
  {
    id: 'daily_win_2',
    name: 'Win 2 Games',
    description: 'Win 2 matches',
    type: 'daily',
    goal: 2,
    rewards: [{ type: 'xp', amount: 100 }],
  },
  {
    id: 'daily_play_5',
    name: 'Play 5 Games',
    description: 'Complete 5 matches in any mode',
    type: 'daily',
    goal: 5,
    rewards: [{ type: 'pack', packType: 'standard', quantity: 2 }],
  },
  {
    id: 'daily_win_3',
    name: 'Win 3 Games',
    description: 'Win 3 matches',
    type: 'daily',
    goal: 3,
    rewards: [{ type: 'pack', packType: 'rare', quantity: 1 }],
  },
];

const WEEKLY_MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: 'weekly_play_20',
    name: 'Play 20 Games',
    description: 'Complete 20 matches in any mode',
    type: 'weekly',
    goal: 20,
    rewards: [{ type: 'pack', packType: 'rare', quantity: 3 }],
  },
  {
    id: 'weekly_win_10',
    name: 'Win 10 Games',
    description: 'Win 10 matches',
    type: 'weekly',
    goal: 10,
    rewards: [{ type: 'pack', packType: 'epic', quantity: 1 }],
  },
  {
    id: 'weekly_play_30',
    name: 'Play 30 Games',
    description: 'Complete 30 matches in any mode',
    type: 'weekly',
    goal: 30,
    rewards: [{ type: 'pack', packType: 'epic', quantity: 2 }],
  },
];

export function generateDailyMissions(): MissionTemplate[] {
  // Return 3 random daily missions
  const shuffled = [...DAILY_MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export function generateWeeklyMissions(): MissionTemplate[] {
  // Return 1 random weekly mission
  const shuffled = [...WEEKLY_MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 1);
}

export function getMissionTemplate(missionId: string): MissionTemplate | null {
  const all = [...DAILY_MISSION_TEMPLATES, ...WEEKLY_MISSION_TEMPLATES];
  return all.find(m => m.id === missionId) || null;
}

export function getMissionExpiryTime(type: 'daily' | 'weekly'): Date {
  const now = new Date();

  if (type === 'daily') {
    // Expires at midnight UTC
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow;
  } else {
    // Expires next Monday at midnight UTC
    const nextMonday = new Date(now);
    const daysUntilMonday = (8 - nextMonday.getUTCDay()) % 7;
    nextMonday.setUTCDate(nextMonday.getUTCDate() + (daysUntilMonday || 7));
    nextMonday.setUTCHours(0, 0, 0, 0);
    return nextMonday;
  }
}
