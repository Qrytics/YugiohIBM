'use client';

import { Card } from '@/lib/cards/types';
import { useState, useEffect } from 'react';

interface PackOpeningModalProps {
  cards: Card[];
  newCards: string[];
  onClose: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'border-gray-400 bg-gray-100',
  rare: 'border-blue-500 bg-blue-100',
  epic: 'border-purple-500 bg-purple-100',
  legendary: 'border-yellow-500 bg-yellow-100',
};

export default function PackOpeningModal({
  cards,
  newCards,
  onClose,
}: PackOpeningModalProps) {
  const [revealedIndex, setRevealedIndex] = useState(-1);

  useEffect(() => {
    if (revealedIndex < cards.length - 1) {
      const timer = setTimeout(() => {
        setRevealedIndex(revealedIndex + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [revealedIndex, cards.length]);

  const isNewCard = (cardId: string) => newCards.includes(cardId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Pack Opening</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`transition-all duration-500 transform ${
                  index <= revealedIndex
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-50'
                }`}
              >
                <div
                  className={`relative rounded-lg border-2 ${
                    RARITY_COLORS[card.rarity] || RARITY_COLORS.common
                  } p-4 shadow-lg`}
                >
                  {isNewCard(card.id) && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 font-bold text-xs px-2 py-1 rounded-full animate-pulse">
                      NEW!
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="font-bold text-sm mb-1">{card.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{card.profession}</p>
                    <div className="space-y-1 text-xs">
                      <div>⚔️ {card.attack}</div>
                      <div>🛡️ {card.defense}</div>
                      <div>❤️ {card.health}</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">{card.rarity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {revealedIndex === cards.length - 1 && (
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
