/**
 * Test Card Database - Updated for Phase 2
 *
 * Now exports from the comprehensive card database
 */

import type { Card } from '../game-engine/types';
import { ALL_CARDS, getCardsByProfession, getRandomCards, buildRandomDeck } from './cardDatabase';

// Export all cards from comprehensive database
export const TEST_CARDS = ALL_CARDS;

// Export helper to get a test deck (30 cards)
export function getTestDeck(): Card[] {
  return buildRandomDeck();
}

// Export profession-specific decks for testing
export function getCloudDeck(): Card[] {
  const cloudCards = getCardsByProfession('cloud');
  const neutralCards = getCardsByProfession('neutral');
  const deck: Card[] = [];

  // Add 15 cloud cards
  for (let i = 0; i < 15 && i < cloudCards.length; i++) {
    deck.push({ ...cloudCards[i] });
    if (cloudCards[i].rarity !== 'legendary' && i + 15 < cloudCards.length) {
      deck.push({ ...cloudCards[i] }); // Add 2 copies
    }
  }

  // Fill rest with neutral cards
  while (deck.length < 30 && neutralCards.length > 0) {
    const card = neutralCards[Math.floor(Math.random() * neutralCards.length)];
    const count = deck.filter(c => c.id === card.id).length;
    if (card.rarity === 'legendary' && count >= 1) continue;
    if (count >= 2) continue;
    deck.push({ ...card });
  }

  return deck.slice(0, 30);
}

export function getAIDeck(): Card[] {
  const aiCards = getCardsByProfession('ai');
  const neutralCards = getCardsByProfession('neutral');
  const deck: Card[] = [];

  // Add 15 AI cards
  for (let i = 0; i < 15 && i < aiCards.length; i++) {
    deck.push({ ...aiCards[i] });
    if (aiCards[i].rarity !== 'legendary' && i + 15 < aiCards.length) {
      deck.push({ ...aiCards[i] }); // Add 2 copies
    }
  }

  // Fill rest with neutral cards
  while (deck.length < 30 && neutralCards.length > 0) {
    const card = neutralCards[Math.floor(Math.random() * neutralCards.length)];
    const count = deck.filter(c => c.id === card.id).length;
    if (card.rarity === 'legendary' && count >= 1) continue;
    if (count >= 2) continue;
    deck.push({ ...card });
  }

  return deck.slice(0, 30);
}

export function getSecurityDeck(): Card[] {
  const securityCards = getCardsByProfession('security');
  const neutralCards = getCardsByProfession('neutral');
  const deck: Card[] = [];

  // Add 15 security cards
  for (let i = 0; i < 15 && i < securityCards.length; i++) {
    deck.push({ ...securityCards[i] });
    if (securityCards[i].rarity !== 'legendary' && i + 15 < securityCards.length) {
      deck.push({ ...securityCards[i] }); // Add 2 copies
    }
  }

  // Fill rest with neutral cards
  while (deck.length < 30 && neutralCards.length > 0) {
    const card = neutralCards[Math.floor(Math.random() * neutralCards.length)];
    const count = deck.filter(c => c.id === card.id).length;
    if (card.rarity === 'legendary' && count >= 1) continue;
    if (count >= 2) continue;
    deck.push({ ...card });
  }

  return deck.slice(0, 30);
}

// Re-export helpers
export { ALL_CARDS, getCardsByProfession, getRandomCards, buildRandomDeck };
