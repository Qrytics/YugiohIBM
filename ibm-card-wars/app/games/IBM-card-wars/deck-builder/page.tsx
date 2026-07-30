'use client';

import { useState } from 'react';
import { Card } from '@/lib/game-engine/types';
import { ALL_CARDS } from '@/lib/cards/cardDatabase';
import { CollectionView } from '@/components/deckbuilder/CollectionView';
import { DeckView } from '@/components/deckbuilder/DeckView';
import { CardFilter } from '@/components/deckbuilder/CardFilter';
import { ManaCurve } from '@/components/deckbuilder/ManaCurve';
import { validateDeck } from '@/lib/deck/DeckValidator';
import { saveDeck, loadDeck, getDeckList } from '@/lib/deck/DeckStorage';

export default function DeckBuilderPage() {
  const [currentDeck, setCurrentDeck] = useState<Card[]>([]);
  const [deckName, setDeckName] = useState<string>('My Deck');
  const [filteredCards, setFilteredCards] = useState<Card[]>(ALL_CARDS);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Add card to deck
  const handleAddCard = (card: Card) => {
    const validation = validateDeck([...currentDeck, card]);

    if (!validation.isValid) {
      alert(validation.errors[0]);
      return;
    }

    setCurrentDeck([...currentDeck, card]);
  };

  // Remove card from deck
  const handleRemoveCard = (index: number) => {
    setCurrentDeck(currentDeck.filter((_, i) => i !== index));
  };

  // Save deck
  const handleSaveDeck = () => {
    const validation = validateDeck(currentDeck);

    if (!validation.isValid) {
      alert('Deck is invalid:\n' + validation.errors.join('\n'));
      return;
    }

    saveDeck(deckName, currentDeck);
    alert(`Deck "${deckName}" saved!`);
  };

  // Load deck
  const handleLoadDeck = (name: string) => {
    const deck = loadDeck(name);
    if (deck) {
      setCurrentDeck(deck.cards);
      setDeckName(deck.name);
    }
  };

  // Clear deck
  const handleClearDeck = () => {
    if (confirm('Clear the current deck?')) {
      setCurrentDeck([]);
    }
  };

  const validation = validateDeck(currentDeck);
  const savedDecks = getDeckList();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-ibm-blue via-ibm-cyan to-ibm-purple bg-clip-text text-transparent">
              Deck Builder
            </span>
          </h1>
          <p className="text-foreground/70">
            Build your perfect 30-card deck from {ALL_CARDS.length} cards
          </p>
        </div>

        {/* Deck Management Bar */}
        <div className="glass rounded-lg p-3 mb-4 flex items-center gap-4">
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="glass px-3 py-2 rounded bg-background border border-foreground/20 text-foreground focus:border-ibm-cyan outline-none"
            placeholder="Deck Name"
          />

          <button
            onClick={handleSaveDeck}
            disabled={!validation.isValid}
            className="glass px-4 py-2 rounded font-bold text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-colors border border-ibm-cyan disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Deck
          </button>

          <select
            onChange={(e) => e.target.value && handleLoadDeck(e.target.value)}
            className="glass px-3 py-2 rounded bg-background border border-foreground/20 text-foreground outline-none"
            defaultValue=""
          >
            <option value="" disabled>Load Deck...</option>
            {savedDecks.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <button
            onClick={handleClearDeck}
            className="glass px-4 py-2 rounded text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-colors"
          >
            Clear
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className={`font-bold ${currentDeck.length === 30 ? 'text-success-green' : currentDeck.length > 30 ? 'text-error-red' : 'text-ibm-cyan'}`}>
              {currentDeck.length}/30 Cards
            </span>
            {!validation.isValid && (
              <span className="text-xs text-error-red">
                ({validation.errors.length} errors)
              </span>
            )}
          </div>
        </div>

        {/* Main Layout: Collection | Deck + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: Collection (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <CardFilter
              allCards={ALL_CARDS}
              onFilterChange={setFilteredCards}
            />

            <CollectionView
              cards={filteredCards}
              onCardClick={handleAddCard}
              currentDeck={currentDeck}
              onCardHover={setSelectedCard}
            />
          </div>

          {/* Right: Deck View + Stats (1/3 width) */}
          <div className="space-y-4">
            <DeckView
              deck={currentDeck}
              onRemoveCard={handleRemoveCard}
              validation={validation}
            />

            <ManaCurve deck={currentDeck} />

            {/* Deck Stats */}
            <div className="glass rounded-lg p-4">
              <h3 className="font-bold text-ibm-cyan mb-3">Deck Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Avg Cost:</span>
                  <span className="font-mono">
                    {currentDeck.length > 0
                      ? (currentDeck.reduce((sum, c) => sum + c.cost, 0) / currentDeck.length).toFixed(1)
                      : '0.0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Employees:</span>
                  <span className="font-mono">
                    {currentDeck.filter(c => c.type === 'employee').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Tools:</span>
                  <span className="font-mono">
                    {currentDeck.filter(c => c.type === 'tool').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Total Attack:</span>
                  <span className="font-mono">
                    {currentDeck.filter(c => c.attack).reduce((sum, c) => sum + (c.attack || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Total Health:</span>
                  <span className="font-mono">
                    {currentDeck.filter(c => c.health).reduce((sum, c) => sum + (c.health || 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Preview */}
            {selectedCard && (
              <div className="glass rounded-lg p-4">
                <h3 className="font-bold text-ibm-cyan mb-2">Card Preview</h3>
                <div className="text-sm space-y-1">
                  <div className="font-bold text-lg">{selectedCard.name}</div>
                  <div className="text-foreground/70">{selectedCard.cost} Mana</div>
                  {selectedCard.attack !== undefined && (
                    <div>{selectedCard.attack}/{selectedCard.health}</div>
                  )}
                  <div className="text-xs text-foreground/60 capitalize">
                    {selectedCard.rarity} {selectedCard.type}
                  </div>
                  <div className="text-xs text-ibm-purple capitalize">
                    {selectedCard.profession}
                  </div>
                  {selectedCard.keywords.length > 0 && (
                    <div className="text-xs text-ibm-cyan">
                      {selectedCard.keywords.join(', ')}
                    </div>
                  )}
                  <div className="mt-2 text-xs">{selectedCard.description}</div>
                  <div className="mt-1 text-xs italic text-foreground/50">
                    "{selectedCard.flavorText}"
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
