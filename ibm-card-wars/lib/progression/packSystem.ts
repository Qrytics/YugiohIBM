/**
 * Pack Opening System
 *
 * Handles pack contents, rarity distribution, and card generation
 */

import { Card, Rarity } from '../game-engine/types';
import { ALL_CARDS } from '../cards/cardDatabase';

export const PACK_SIZES = {
  standard: 5,
  rare: 7,
  epic: 10,
} as const;

export type PackType = keyof typeof PACK_SIZES;

export interface RarityRates {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
}

export const RARITY_RATES: Record<PackType, RarityRates> = {
  standard: {
    common: 0.70,
    rare: 0.20,
    epic: 0.08,
    legendary: 0.02,
  },
  rare: {
    common: 0.50,
    rare: 0.30,
    epic: 0.15,
    legendary: 0.05,
  },
  epic: {
    common: 0.30,
    rare: 0.40,
    epic: 0.20,
    legendary: 0.10,
  },
};

/**
 * Generate a random card based on rarity
 */
function getRandomCardByRarity(rarity: Rarity): Card {
  const cardsOfRarity = ALL_CARDS.filter(card => card.rarity === rarity);
  if (cardsOfRarity.length === 0) {
    // Fallback to common if no cards of that rarity exist
    const commonCards = ALL_CARDS.filter(card => card.rarity === 'common');
    return commonCards[Math.floor(Math.random() * commonCards.length)];
  }
  return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
}

/**
 * Roll a rarity based on pack type rates
 */
function rollRarity(packType: PackType): Rarity {
  const rates = RARITY_RATES[packType];
  const roll = Math.random();

  let cumulative = 0;
  for (const [rarity, rate] of Object.entries(rates)) {
    cumulative += rate;
    if (roll < cumulative) {
      return rarity as Rarity;
    }
  }

  return 'common'; // Fallback
}

/**
 * Generate pack contents
 * Guarantees at least 1 rare+ card in standard packs
 */
export function generatePackContents(packType: PackType): Card[] {
  const packSize = PACK_SIZES[packType];
  const cards: Card[] = [];

  // For standard packs, guarantee 1 rare+ card
  if (packType === 'standard') {
    // First card: guaranteed rare or better
    const guaranteedRarity = rollRarity('rare' as PackType);
    cards.push(getRandomCardByRarity(guaranteedRarity));

    // Remaining cards: normal distribution
    for (let i = 1; i < packSize; i++) {
      const rarity = rollRarity(packType);
      cards.push(getRandomCardByRarity(rarity));
    }
  } else {
    // Other pack types: all cards follow normal distribution
    for (let i = 0; i < packSize; i++) {
      const rarity = rollRarity(packType);
      cards.push(getRandomCardByRarity(rarity));
    }
  }

  return cards;
}

/**
 * Get pack display info
 */
export function getPackInfo(packType: PackType) {
  return {
    type: packType,
    size: PACK_SIZES[packType],
    name: packType.charAt(0).toUpperCase() + packType.slice(1) + ' Pack',
    description: getPackDescription(packType),
    color: getPackColor(packType),
  };
}

function getPackDescription(packType: PackType): string {
  switch (packType) {
    case 'standard':
      return 'Contains 5 cards with guaranteed rare or better';
    case 'rare':
      return 'Contains 7 cards with higher rare chances';
    case 'epic':
      return 'Contains 10 cards with excellent legendary odds';
  }
}

function getPackColor(packType: PackType): string {
  switch (packType) {
    case 'standard':
      return '#4A90E2';
    case 'rare':
      return '#9B59B6';
    case 'epic':
      return '#E67E22';
  }
}

/**
 * Check which cards are new to the user's collection
 */
export function identifyNewCards(
  packedCards: Card[],
  ownedCardIds: Set<string>
): string[] {
  return packedCards
    .filter(card => !ownedCardIds.has(card.id))
    .map(card => card.id);
}
