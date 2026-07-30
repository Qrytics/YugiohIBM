'use client';

import type { Card } from '@/lib/game-engine/types';

interface CollectionViewProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
  currentDeck: Card[];
  onCardHover?: (card: Card | null) => void;
}

export function CollectionView({
  cards,
  onCardClick,
  currentDeck,
  onCardHover,
}: CollectionViewProps) {
  // Count how many copies of each card are in the deck
  const getCardCount = (cardId: string): number => {
    return currentDeck.filter((c) => c.id === cardId).length;
  };

  // Check if card can be added (respecting limits)
  const canAddCard = (card: Card): boolean => {
    const count = getCardCount(card.id);
    if (card.rarity === 'legendary') return count < 1;
    return count < 2;
  };

  return (
    <div className="glass rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-ibm-cyan">Collection</h2>
        <span className="text-sm text-foreground/70">
          {cards.length} cards
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 max-h-[600px] overflow-y-auto">
        {cards.map((card) => {
          const count = getCardCount(card.id);
          const canAdd = canAddCard(card);
          const isMaxed = !canAdd;

          return (
            <div
              key={card.id}
              className={`
                relative glass rounded p-2 transition-all cursor-pointer
                ${canAdd ? 'hover:scale-105 hover:brightness-125 border border-transparent hover:border-ibm-cyan' : 'opacity-50 cursor-not-allowed'}
                ${count > 0 ? 'ring-1 ring-ibm-cyan' : ''}
              `}
              onClick={() => canAdd && onCardClick(card)}
              onMouseEnter={() => onCardHover?.(card)}
              onMouseLeave={() => onCardHover?.(null)}
            >
              {/* Cost */}
              <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-mana flex items-center justify-center font-bold text-white text-xs">
                {card.cost}
              </div>

              {/* Count Badge */}
              {count > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-ibm-cyan flex items-center justify-center font-bold text-background text-xs">
                  {count}
                </div>
              )}

              {/* Card Name */}
              <div className={`font-bold text-xs truncate mt-4 ${
                card.rarity === 'legendary' ? 'text-warning-yellow' :
                card.rarity === 'epic' ? 'text-ibm-purple' :
                card.rarity === 'rare' ? 'text-ibm-blue' :
                'text-foreground'
              }`}>
                {card.name}
              </div>

              {/* Art Placeholder */}
              <div className="h-20 bg-gradient-to-br from-card-frame to-background rounded mt-1 flex items-center justify-center opacity-60">
                <div className="text-[8px] uppercase tracking-wider opacity-50 text-center px-1">
                  {card.profession}
                </div>
              </div>

              {/* Stats */}
              {card.type === 'employee' && (
                <div className="flex justify-between items-center mt-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center font-bold text-white text-[10px]">
                    {card.attack}
                  </div>
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center font-bold text-white text-[10px]">
                    {card.health}
                  </div>
                </div>
              )}

              {/* Type for non-employees */}
              {card.type !== 'employee' && (
                <div className="text-[9px] text-center opacity-60 capitalize mt-1">
                  {card.type}
                </div>
              )}

              {/* Maxed overlay */}
              {isMaxed && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
                  <span className="text-xs font-bold text-foreground/70">MAX</span>
                </div>
              )}
            </div>
          );
        })}

        {cards.length === 0 && (
          <div className="col-span-full text-center py-12 text-foreground/50">
            No cards match your filters
          </div>
        )}
      </div>
    </div>
  );
}
