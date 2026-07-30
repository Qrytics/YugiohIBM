'use client';

import { Card } from '@/lib/cards/types';
import { useState } from 'react';

interface CardTileProps {
  card: Card;
  quantity: number;
  owned: boolean;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'border-gray-400',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
};

export default function CardTile({ card, quantity, owned }: CardTileProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`relative rounded-lg border-2 ${
        RARITY_COLORS[card.rarity] || 'border-gray-400'
      } overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
        !owned ? 'opacity-40 grayscale' : ''
      }`}
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 p-4">
        <div className="text-white">
          <h3 className="font-bold text-sm mb-1">{card.name}</h3>
          <p className="text-xs opacity-80">{card.profession}</p>
          <div className="mt-2 space-y-1 text-xs">
            <div>⚔️ {card.attack}</div>
            <div>🛡️ {card.defense}</div>
            <div>❤️ {card.health}</div>
          </div>
        </div>
      </div>
      {owned && quantity > 1 && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 font-bold text-xs px-2 py-1 rounded-full">
          {quantity}x
        </div>
      )}
      {!owned && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <span className="text-white font-bold text-lg">🔒</span>
        </div>
      )}
    </div>
  );
}
