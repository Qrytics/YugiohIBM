import type { Card } from '../game-engine/types';

export interface DeckValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateDeck(deck: Card[]): DeckValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Rule 1: Must have exactly 30 cards
  if (deck.length < 30) {
    errors.push(`Deck must have 30 cards (currently ${deck.length})`);
  } else if (deck.length > 30) {
    errors.push(`Deck cannot have more than 30 cards (currently ${deck.length})`);
  }

  // Rule 2: Max 2 copies of any card
  const cardCounts = new Map<string, number>();
  deck.forEach((card) => {
    cardCounts.set(card.id, (cardCounts.get(card.id) || 0) + 1);
  });

  cardCounts.forEach((count, cardId) => {
    const card = deck.find((c) => c.id === cardId);
    if (!card) return;

    if (card.rarity === 'legendary' && count > 1) {
      errors.push(`${card.name} is legendary and can only have 1 copy (found ${count})`);
    } else if (count > 2) {
      errors.push(`${card.name} can have max 2 copies (found ${count})`);
    }
  });

  // Warnings
  if (deck.length === 30) {
    // Warning: No profession focus
    const professionCounts = new Map<string, number>();
    deck.forEach((card) => {
      if (card.profession !== 'neutral') {
        professionCounts.set(
          card.profession,
          (professionCounts.get(card.profession) || 0) + 1
        );
      }
    });

    const maxProfessionCount = Math.max(0, ...Array.from(professionCounts.values()));
    if (maxProfessionCount < 10) {
      warnings.push('No strong profession focus (consider 10+ cards from one profession)');
    }

    // Warning: Mana curve
    const avgCost = deck.reduce((sum, c) => sum + c.cost, 0) / deck.length;
    if (avgCost < 2) {
      warnings.push('Very low mana curve (might run out of cards)');
    } else if (avgCost > 5) {
      warnings.push('Very high mana curve (might be too slow)');
    }

    // Warning: Card type balance
    const employeeCount = deck.filter((c) => c.type === 'employee').length;
    if (employeeCount < 15) {
      warnings.push('Few employees (might lack board presence)');
    } else if (employeeCount > 25) {
      warnings.push('Many employees (might lack tools/removal)');
    }
  }

  return {
    isValid: errors.length === 0 && deck.length === 30,
    errors,
    warnings,
  };
}

export function getDeckStats(deck: Card[]) {
  const professionCounts = new Map<string, number>();
  const rarityCounts = new Map<string, number>();
  const costCounts = new Map<number, number>();
  const typeCounts = new Map<string, number>();

  deck.forEach((card) => {
    // Profession
    professionCounts.set(
      card.profession,
      (professionCounts.get(card.profession) || 0) + 1
    );

    // Rarity
    rarityCounts.set(
      card.rarity,
      (rarityCounts.get(card.rarity) || 0) + 1
    );

    // Cost
    costCounts.set(
      card.cost,
      (costCounts.get(card.cost) || 0) + 1
    );

    // Type
    typeCounts.set(
      card.type,
      (typeCounts.get(card.type) || 0) + 1
    );
  });

  const avgCost = deck.length > 0
    ? deck.reduce((sum, c) => sum + c.cost, 0) / deck.length
    : 0;

  const totalAttack = deck
    .filter((c) => c.attack !== undefined)
    .reduce((sum, c) => sum + (c.attack || 0), 0);

  const totalHealth = deck
    .filter((c) => c.health !== undefined)
    .reduce((sum, c) => sum + (c.health || 0), 0);

  return {
    professionCounts: Object.fromEntries(professionCounts),
    rarityCounts: Object.fromEntries(rarityCounts),
    costCounts: Object.fromEntries(costCounts),
    typeCounts: Object.fromEntries(typeCounts),
    avgCost,
    totalAttack,
    totalHealth,
  };
}
