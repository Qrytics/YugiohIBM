import type { Card } from '../game-engine/types';

// Import profession-specific cards
import { neutralCards } from './data/neutral';
import { cloudCards } from './data/cloud';
import { aiCards } from './data/ai';
import { securityCards } from './data/security';
import { dataCards } from './data/data';
import { softwareCards } from './data/software';
import { devopsCards } from './data/devops';
import { uxCards } from './data/ux';
import { pmCards } from './data/pm';
import { businessCards } from './data/business';
import { salesCards } from './data/sales';
import { mainframeCards } from './data/mainframe';
import { sreCards } from './data/sre';

// Master card database
export const ALL_CARDS: Card[] = [
  ...neutralCards,
  ...cloudCards,
  ...aiCards,
  ...securityCards,
  ...dataCards,
  ...softwareCards,
  ...devopsCards,
  ...uxCards,
  ...pmCards,
  ...businessCards,
  ...salesCards,
  ...mainframeCards,
  ...sreCards,
];

// Card lookup by ID
export function getCardById(id: string): Card | undefined {
  return ALL_CARDS.find((card) => card.id === id);
}

// Get cards by profession
export function getCardsByProfession(profession: string): Card[] {
  return ALL_CARDS.filter((card) => card.profession === profession);
}

// Get cards by rarity
export function getCardsByRarity(rarity: string): Card[] {
  return ALL_CARDS.filter((card) => card.rarity === rarity);
}

// Get cards by type
export function getCardsByType(type: string): Card[] {
  return ALL_CARDS.filter((card) => card.type === type);
}

// Get cards by cost
export function getCardsByCost(cost: number): Card[] {
  return ALL_CARDS.filter((card) => card.cost === cost);
}

// Get random card (for pack opening)
export function getRandomCard(): Card {
  return ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)];
}

// Get random cards with rarity distribution (for pack opening)
export function getRandomCards(count: number): Card[] {
  const cards: Card[] = [];

  for (let i = 0; i < count; i++) {
    // Rarity distribution: 70% common, 20% rare, 8% epic, 1.9% legendary, 0.1% mythic
    const roll = Math.random() * 100;
    let rarity: string;

    if (roll < 70) rarity = 'common';
    else if (roll < 90) rarity = 'rare';
    else if (roll < 98) rarity = 'epic';
    else if (roll < 99.9) rarity = 'legendary';
    else rarity = 'mythic';

    const pool = getCardsByRarity(rarity);
    if (pool.length > 0) {
      cards.push(pool[Math.floor(Math.random() * pool.length)]);
    }
  }

  return cards;
}

// Build a random deck (30 cards)
export function buildRandomDeck(): Card[] {
  const deck: Card[] = [];

  // Pick a random profession or neutral
  const professions = ['neutral', 'cloud', 'ai', 'security', 'data', 'software', 'devops', 'ux', 'pm', 'business', 'sales', 'mainframe', 'sre'];
  const mainProfession = professions[Math.floor(Math.random() * professions.length)];

  // Get cards from main profession and neutral
  const professionPool = mainProfession === 'neutral'
    ? neutralCards
    : [...getCardsByProfession(mainProfession), ...neutralCards.filter(c => c.type === 'employee')];

  // Build deck (simple random, no balancing)
  while (deck.length < 30 && professionPool.length > 0) {
    const card = professionPool[Math.floor(Math.random() * professionPool.length)];
    const count = deck.filter(c => c.id === card.id).length;

    // Max 2 copies, 1 for legendary
    if (card.rarity === 'legendary' && count >= 1) continue;
    if (count >= 2) continue;

    deck.push({ ...card });
  }

  return deck;
}

// Statistics
export function getCardStats() {
  return {
    total: ALL_CARDS.length,
    byType: {
      employee: getCardsByType('employee').length,
      tool: getCardsByType('tool').length,
      incident: getCardsByType('incident').length,
      executive: getCardsByType('executive').length,
      upgrade: getCardsByType('upgrade').length,
    },
    byRarity: {
      common: getCardsByRarity('common').length,
      rare: getCardsByRarity('rare').length,
      epic: getCardsByRarity('epic').length,
      legendary: getCardsByRarity('legendary').length,
      mythic: getCardsByRarity('mythic').length,
    },
    byProfession: {
      neutral: getCardsByProfession('neutral').length,
      cloud: getCardsByProfession('cloud').length,
      ai: getCardsByProfession('ai').length,
      security: getCardsByProfession('security').length,
      data: getCardsByProfession('data').length,
      software: getCardsByProfession('software').length,
      devops: getCardsByProfession('devops').length,
      ux: getCardsByProfession('ux').length,
      pm: getCardsByProfession('pm').length,
      business: getCardsByProfession('business').length,
      sales: getCardsByProfession('sales').length,
      mainframe: getCardsByProfession('mainframe').length,
      sre: getCardsByProfession('sre').length,
    },
  };
}
