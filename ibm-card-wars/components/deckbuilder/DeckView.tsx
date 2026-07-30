'use client';

import type { Card } from '@/lib/game-engine/types';
import type { DeckValidation } from '@/lib/deck/DeckValidator';

interface DeckViewProps {
  deck: Card[];
  onRemoveCard: (index: number) => void;
  validation: DeckValidation;
}

export function DeckView({ deck, onRemoveCard, validation }: DeckViewProps) {
  // Group cards by ID for cleaner display
  const groupedCards = deck.reduce((acc, card, index) => {
    if (!acc[card.id]) {
      acc[card.id] = { card, indices: [] };
    }
    acc[card.id].indices.push(index);
    return acc;
  }, {} as Record<string, { card: Card; indices: number[] }>);

  const sortedEntries = Object.entries(groupedCards).sort((a, b) => {
    const cardA = a[1].card;
    const cardB = b[1].card;
    if (cardA.cost !== cardB.cost) return cardA.cost - cardB.cost;
    return cardA.name.localeCompare(cardB.name);
  });

  return (
    <div className="glass rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-ibm-cyan">Current Deck</h2>
        <span className={`font-bold ${
          deck.length === 30 ? 'text-success-green' :
          deck.length > 30 ? 'text-error-red' :
          'text-foreground/70'
        }`}>
          {deck.length}/30
        </span>
      </div>

      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <div className="mb-3 p-2 rounded bg-error-red/10 border border-error-red/30">
          <div className="text-xs font-bold text-error-red mb-1">Errors:</div>
          {validation.errors.map((error, i) => (
            <div key={i} className="text-xs text-error-red">{error}</div>
          ))}
        </div>
      )}

      {/* Validation Warnings */}
      {validation.warnings.length > 0 && validation.isValid && (
        <div className="mb-3 p-2 rounded bg-warning-yellow/10 border border-warning-yellow/30">
          <div className="text-xs font-bold text-warning-yellow mb-1">Warnings:</div>
          {validation.warnings.map((warning, i) => (
            <div key={i} className="text-xs text-warning-yellow">{warning}</div>
          ))}
        </div>
      )}

      {/* Card List */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {sortedEntries.map(([cardId, { card, indices }]) => (
          <div
            key={cardId}
            className="glass rounded p-2 flex items-center justify-between hover:bg-foreground/5 transition-colors group"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Cost */}
              <div className="w-6 h-6 rounded-full bg-mana flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                {card.cost}
              </div>

              {/* Name */}
              <div className={`font-bold text-sm truncate ${
                card.rarity === 'legendary' ? 'text-warning-yellow' :
                card.rarity === 'epic' ? 'text-ibm-purple' :
                card.rarity === 'rare' ? 'text-ibm-blue' :
                'text-foreground'
              }`}>
                {card.name}
              </div>

              {/* Stats */}
              {card.type === 'employee' && (
                <div className="flex gap-1 flex-shrink-0">
                  <span className="text-xs text-orange-500">{card.attack}</span>
                  <span className="text-xs text-foreground/50">/</span>
                  <span className="text-xs text-red-500">{card.health}</span>
                </div>
              )}
            </div>

            {/* Count & Remove */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-foreground/50 w-4 text-center">
                {indices.length}x
              </span>
              <button
                onClick={() => onRemoveCard(indices[indices.length - 1])}
                className="w-6 h-6 rounded flex items-center justify-center text-error-red opacity-0 group-hover:opacity-100 hover:bg-error-red hover:text-background transition-all"
                title="Remove one copy"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {deck.length === 0 && (
          <div className="text-center py-8 text-foreground/50 text-sm">
            Click cards from the collection to add them
          </div>
        )}
      </div>

      {/* Valid indicator */}
      {validation.isValid && deck.length === 30 && (
        <div className="mt-3 p-2 rounded bg-success-green/10 border border-success-green/30 text-center">
          <span className="text-xs font-bold text-success-green">✓ Deck Ready!</span>
        </div>
      )}
    </div>
  );
}
