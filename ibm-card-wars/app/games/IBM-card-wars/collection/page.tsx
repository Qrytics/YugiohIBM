'use client';

import { useState } from 'react';
import { ALL_CARDS } from '@/lib/cards/cardDatabase';
import { CardFilter } from '@/components/deckbuilder/CardFilter';
import { getDeckStats } from '@/lib/deck/DeckValidator';
import Link from 'next/link';

export default function CollectionPage() {
  const [filteredCards, setFilteredCards] = useState(ALL_CARDS);
  const [selectedCard, setSelectedCard] = useState(ALL_CARDS[0]);

  const stats = getDeckStats(ALL_CARDS);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-ibm-blue via-ibm-cyan to-ibm-purple bg-clip-text text-transparent">
                Collection
              </span>
            </h1>
            <p className="text-foreground/70">
              Browse all {ALL_CARDS.length} cards
            </p>
          </div>
          <Link
            href="/games/IBM-card-wars/deck-builder"
            className="glass px-6 py-3 rounded-lg font-bold text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-colors border border-ibm-cyan"
          >
            Build Deck →
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="glass rounded-lg p-4">
            <div className="text-2xl font-bold text-ibm-cyan">{ALL_CARDS.length}</div>
            <div className="text-sm text-foreground/70">Total Cards</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="text-2xl font-bold text-ibm-blue">{stats.typeCounts.employee || 0}</div>
            <div className="text-sm text-foreground/70">Employees</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="text-2xl font-bold text-ibm-purple">13</div>
            <div className="text-sm text-foreground/70">Professions</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="text-2xl font-bold text-warning-yellow">{stats.rarityCounts.legendary || 0}</div>
            <div className="text-sm text-foreground/70">Legendaries</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: Filters + Card Grid */}
          <div className="lg:col-span-2 space-y-4">
            <CardFilter
              allCards={ALL_CARDS}
              onFilterChange={setFilteredCards}
            />

            {/* Card Grid */}
            <div className="glass rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-ibm-cyan">Cards</h2>
                <span className="text-sm text-foreground/70">
                  {filteredCards.length} cards
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-[700px] overflow-y-auto">
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className={`
                      relative glass rounded p-2 transition-all cursor-pointer
                      hover:scale-105 hover:brightness-125 border
                      ${selectedCard?.id === card.id ? 'border-ibm-cyan' : 'border-transparent'}
                    `}
                    onClick={() => setSelectedCard(card)}
                  >
                    {/* Cost */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-mana flex items-center justify-center font-bold text-white text-xs">
                      {card.cost}
                    </div>

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
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Selected Card Details */}
          <div className="space-y-4">
            {selectedCard && (
              <div className="glass rounded-lg p-4 sticky top-4">
                <h3 className="font-bold text-ibm-cyan mb-3">Card Details</h3>

                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">{selectedCard.name}</div>
                    <div className="text-sm text-foreground/70 capitalize">
                      {selectedCard.rarity} {selectedCard.type}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-mana flex items-center justify-center font-bold text-white">
                      {selectedCard.cost}
                    </div>
                    {selectedCard.type === 'employee' && (
                      <>
                        <div className="text-xl">
                          <span className="text-orange-500 font-bold">{selectedCard.attack}</span>
                          <span className="text-foreground/50">/</span>
                          <span className="text-red-500 font-bold">{selectedCard.health}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="glass p-3 rounded">
                    <div className="text-xs text-foreground/70 mb-1">Profession</div>
                    <div className="capitalize text-ibm-purple font-bold">{selectedCard.profession}</div>
                  </div>

                  {selectedCard.keywords.length > 0 && (
                    <div className="glass p-3 rounded">
                      <div className="text-xs text-foreground/70 mb-1">Keywords</div>
                      <div className="text-ibm-cyan capitalize">
                        {selectedCard.keywords.join(', ')}
                      </div>
                    </div>
                  )}

                  <div className="glass p-3 rounded">
                    <div className="text-xs text-foreground/70 mb-1">Description</div>
                    <div className="text-sm">{selectedCard.description}</div>
                  </div>

                  <div className="glass p-3 rounded">
                    <div className="text-xs text-foreground/70 mb-1">Flavor</div>
                    <div className="text-sm italic text-foreground/70">"{selectedCard.flavorText}"</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
