/**
 * Test Card Database
 *
 * Simple set of ~20 cards for Phase 1 testing
 */

import type { Card } from '../game-engine/types';

export const TEST_CARDS: Card[] = [
  // === NEUTRAL COMMONS (1-2 cost) ===
  {
    id: 'neutral_001',
    name: 'Junior Developer',
    cost: 1,
    type: 'employee',
    rarity: 'common',
    profession: 'neutral',
    attack: 1,
    health: 2,
    description: 'A fresh hire eager to learn.',
    flavorText: '"Where do I find the config file?"',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  {
    id: 'neutral_002',
    name: 'Coffee Break',
    cost: 1,
    type: 'tool',
    rarity: 'common',
    profession: 'neutral',
    description: 'Draw a card.',
    flavorText: '"Caffeine-driven development at its finest."',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  {
    id: 'neutral_003',
    name: 'Intern',
    cost: 1,
    type: 'employee',
    rarity: 'common',
    profession: 'neutral',
    attack: 1,
    health: 1,
    description: 'Basic employee.',
    flavorText: '"Just happy to be here!"',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  {
    id: 'neutral_004',
    name: 'Mid-Level Engineer',
    cost: 2,
    type: 'employee',
    rarity: 'common',
    profession: 'neutral',
    attack: 2,
    health: 3,
    description: 'Solid stats for the cost.',
    flavorText: '"I know what I\'m doing... mostly."',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  {
    id: 'neutral_005',
    name: 'Senior Engineer',
    cost: 3,
    type: 'employee',
    rarity: 'common',
    profession: 'neutral',
    attack: 3,
    health: 4,
    description: 'Reliable employee.',
    flavorText: '"Been there, debugged that."',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  // === CLOUD CONSULTANT CARDS ===
  {
    id: 'cloud_001',
    name: 'Cloud Architect',
    cost: 4,
    type: 'employee',
    rarity: 'rare',
    profession: 'cloud',
    attack: 3,
    health: 4,
    battlecry: {
      type: 'buff',
      target: { type: 'all_friendly', profession: 'cloud' },
      amount: 1,
    },
    description: 'Battlecry: Give all Cloud employees +1/+1.',
    flavorText: '"Everything scales in the cloud!"',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  {
    id: 'cloud_002',
    name: 'Junior Cloud Consultant',
    cost: 2,
    type: 'employee',
    rarity: 'common',
    profession: 'cloud',
    attack: 2,
    health: 2,
    description: 'Basic Cloud employee.',
    flavorText: '"What\'s a VPC again?"',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  // === AI ENGINEER CARDS ===
  {
    id: 'ai_001',
    name: 'ML Engineer',
    cost: 3,
    type: 'employee',
    rarity: 'epic',
    profession: 'ai',
    attack: 2,
    health: 3,
    trigger: {
      on: 'end_of_turn',
      effect: {
        type: 'summon',
        cardId: 'ai_token_001',
      },
    },
    description: 'At end of turn, summon a 1/1 AI Bot.',
    flavorText: '"Training models while you sleep."',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  // === SECURITY CONSULTANT CARDS ===
  {
    id: 'security_001',
    name: 'Security Analyst',
    cost: 2,
    type: 'employee',
    rarity: 'common',
    profession: 'security',
    attack: 1,
    health: 3,
    description: 'Taunt',
    flavorText: '"You shall not pass! (without 2FA)"',
    artUrl: '/cards/placeholder.png',
    keywords: ['taunt'],
  },

  {
    id: 'security_002',
    name: 'CISO',
    cost: 8,
    type: 'executive',
    rarity: 'legendary',
    profession: 'security',
    attack: 6,
    health: 8,
    description: 'Taunt. Divine Shield. All friendly employees have Taunt.',
    flavorText: '"Security is everyone\'s responsibility."',
    artUrl: '/cards/placeholder.png',
    keywords: ['taunt', 'divine_shield'],
  },

  // === DEVOPS ENGINEER CARDS ===
  {
    id: 'devops_001',
    name: 'DevOps Engineer',
    cost: 3,
    type: 'employee',
    rarity: 'common',
    profession: 'devops',
    attack: 3,
    health: 2,
    description: 'Rush',
    flavorText: '"Ship it!"',
    artUrl: '/cards/placeholder.png',
    keywords: ['rush'],
  },

  {
    id: 'devops_002',
    name: 'CI/CD Pipeline',
    cost: 2,
    type: 'tool',
    rarity: 'common',
    profession: 'devops',
    description: 'Give all friendly employees Rush this turn.',
    flavorText: '"Fast deployment, faster delivery."',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  // === SOFTWARE DEVELOPER CARDS ===
  {
    id: 'software_001',
    name: 'Full-Stack Developer',
    cost: 4,
    type: 'employee',
    rarity: 'rare',
    profession: 'software',
    attack: 4,
    health: 4,
    description: 'Solid all-around employee.',
    flavorText: '"I can do frontend AND backend!"',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  {
    id: 'software_002',
    name: 'Bug Fix',
    cost: 1,
    type: 'tool',
    rarity: 'common',
    profession: 'software',
    description: 'Heal an employee to full health.',
    flavorText: '"Works on my machine!"',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  // === DATA ENGINEER CARDS ===
  {
    id: 'data_001',
    name: 'Data Engineer',
    cost: 3,
    type: 'employee',
    rarity: 'common',
    profession: 'data',
    attack: 2,
    health: 4,
    battlecry: {
      type: 'draw',
      amount: 1,
    },
    description: 'Battlecry: Draw a card.',
    flavorText: '"Data is the new oil."',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  // === SRE CARDS ===
  {
    id: 'sre_001',
    name: 'Site Reliability Engineer',
    cost: 4,
    type: 'employee',
    rarity: 'rare',
    profession: 'sre',
    attack: 3,
    health: 5,
    keywords: ['lifesteal'],
    description: 'Lifesteal',
    flavorText: '"Keep calm and monitor metrics."',
    artUrl: '/cards/placeholder.png',
  },

  // === INCIDENTS (NEGATIVE EVENTS) ===
  {
    id: 'incident_001',
    name: 'Production Outage',
    cost: 5,
    type: 'incident',
    rarity: 'epic',
    profession: 'neutral',
    description: 'Destroy all employees in a lane.',
    flavorText: '"P0! All hands on deck!"',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  {
    id: 'incident_002',
    name: 'Security Breach',
    cost: 3,
    type: 'incident',
    rarity: 'rare',
    profession: 'neutral',
    description: 'Deal 3 damage to all enemy employees.',
    flavorText: '"We\'ve been compromised!"',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  // === TOOLS ===
  {
    id: 'tool_001',
    name: 'Kubernetes',
    cost: 3,
    type: 'tool',
    rarity: 'rare',
    profession: 'cloud',
    description: 'Summon three 1/1 Pods.',
    flavorText: '"Orchestration at scale."',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },

  {
    id: 'tool_002',
    name: 'Git Revert',
    cost: 2,
    type: 'tool',
    rarity: 'common',
    profession: 'software',
    description: 'Return an employee to its owner\'s hand.',
    flavorText: '"Ctrl+Z the deployment!"',
    artUrl: '/cards/placeholder.png',
    keywords: [],
  },
];

/**
 * Get a test deck (30 cards)
 */
export function getTestDeck(): Card[] {
  const deck: Card[] = [];

  // Add 2 copies of each employee card (except legendaries)
  const employees = TEST_CARDS.filter(
    (card) => card.type === 'employee' && card.rarity !== 'legendary'
  );

  for (const card of employees) {
    deck.push({ ...card }, { ...card }); // 2 copies
  }

  // Add 1 copy of each tool
  const tools = TEST_CARDS.filter((card) => card.type === 'tool');
  for (const tool of tools) {
    deck.push({ ...tool });
  }

  // Fill remaining slots with neutrals
  while (deck.length < 30) {
    const neutral = TEST_CARDS.find((c) => c.id === 'neutral_001');
    if (neutral) {
      deck.push({ ...neutral });
    }
  }

  // Trim to exactly 30
  return deck.slice(0, 30);
}
