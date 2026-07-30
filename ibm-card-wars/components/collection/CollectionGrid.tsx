'use client';

import { Card } from '@/lib/cards/types';
import CardTile from './CardTile';

interface CollectionGridProps {
  cards: Array<{ card: Card; quantity: number; owned: boolean }>;
}

export default function CollectionGrid({ cards }: CollectionGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No cards found</p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your filters or open some packs!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map(({ card, quantity, owned }) => (
        <CardTile key={card.id} card={card} quantity={quantity} owned={owned} />
      ))}
    </div>
  );
}
