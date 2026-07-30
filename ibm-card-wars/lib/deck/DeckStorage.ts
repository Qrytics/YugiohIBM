import type { Card } from '../game-engine/types';
import { getCardById } from '../cards/cardDatabase';

const STORAGE_KEY = 'ibm_card_wars_decks';

export interface SavedDeck {
  name: string;
  cards: Card[];
  createdAt: number;
  updatedAt: number;
}

// Get all saved decks from localStorage
export function getAllDecks(): Record<string, SavedDeck> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const decks = JSON.parse(stored);
    return decks;
  } catch (error) {
    console.error('Failed to load decks:', error);
    return {};
  }
}

// Get list of deck names
export function getDeckList(): string[] {
  const decks = getAllDecks();
  return Object.keys(decks).sort();
}

// Save a deck
export function saveDeck(name: string, cards: Card[]): void {
  if (typeof window === 'undefined') return;

  try {
    const decks = getAllDecks();
    const now = Date.now();

    decks[name] = {
      name,
      cards,
      createdAt: decks[name]?.createdAt || now,
      updatedAt: now,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  } catch (error) {
    console.error('Failed to save deck:', error);
    throw new Error('Failed to save deck');
  }
}

// Load a deck
export function loadDeck(name: string): SavedDeck | null {
  const decks = getAllDecks();
  return decks[name] || null;
}

// Delete a deck
export function deleteDeck(name: string): void {
  if (typeof window === 'undefined') return;

  try {
    const decks = getAllDecks();
    delete decks[name];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  } catch (error) {
    console.error('Failed to delete deck:', error);
    throw new Error('Failed to delete deck');
  }
}

// Export deck as JSON string (for sharing)
export function exportDeck(deck: SavedDeck): string {
  return JSON.stringify({
    name: deck.name,
    cardIds: deck.cards.map((c) => c.id),
    version: '1.0',
  }, null, 2);
}

// Import deck from JSON string
export function importDeck(jsonString: string): SavedDeck | null {
  try {
    const data = JSON.parse(jsonString);

    if (!data.name || !data.cardIds || !Array.isArray(data.cardIds)) {
      throw new Error('Invalid deck format');
    }

    const cards: Card[] = [];
    for (const id of data.cardIds) {
      const card = getCardById(id);
      if (!card) {
        console.warn(`Card not found: ${id}`);
        continue;
      }
      cards.push(card);
    }

    if (cards.length === 0) {
      throw new Error('No valid cards found');
    }

    return {
      name: data.name,
      cards,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  } catch (error) {
    console.error('Failed to import deck:', error);
    return null;
  }
}

// Clear all decks (for debugging)
export function clearAllDecks(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
