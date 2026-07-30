/**
 * Pack System - Pack opening and card generation
 */

import { getAllCards } from '../cards/cardData';
import { Card } from '../cards/types';

export type PackType = 'standard' | 'rare' | 'epic';

const PACK_SIZES: Record<PackType, number> = {
  standard: 5,
  rare: 7,
  epic: 10,
};

const RARITY_RATES: Record<PackType, Record<string, number>> = {
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

export function generatePackContents(packType: PackType): Card[] {
  const allCards = getAllCards();
  const packSize = PACK_SIZES[packType];
  const rates = RARITY_RATES[packType];
  const cards: Card[] = [];

  // Group cards by rarity
  const cardsByRarity: Record<string, Card[]> = {
    common: allCards.filter(c => c.rarity === 'common'),
    rare: allCards.filter(c => c.rarity === 'rare'),
    epic: allCards.filter(c => c.rarity === 'epic'),
    legendary: allCards.filter(c => c.rarity === 'legendary'),
  };

  // Guarantee at least one rare+ in standard packs
  if (packType === 'standard') {
    const guaranteedRare = getRandomCard(cardsByRarity.rare);
    if (guaranteedRare) cards.push(guaranteedRare);
  }

  // Fill remaining slots
  while (cards.length < packSize) {
    const rarity = getRandomRarity(rates);
    const card = getRandomCard(cardsByRarity[rarity]);
    if (card) cards.push(card);
  }

  return cards;
}

function getRandomRarity(rates: Record<string, number>): string {
  const roll = Math.random();
  let cumulative = 0;

  for (const [rarity, rate] of Object.entries(rates)) {
    cumulative += rate;
    if (roll < cumulative) {
      return rarity;
    }
  }

  return 'common';
}

function getRandomCard(cards: Card[]): Card | null {
  if (cards.length === 0) return null;
  const index = Math.floor(Math.random() * cards.length);
  return cards[index];
}

export function identifyNewCards(
  cards: Card[],
  ownedCardIds: Set<string>
): string[] {
  return cards.filter(card => !ownedCardIds.has(card.id)).map(card => card.id);
}
