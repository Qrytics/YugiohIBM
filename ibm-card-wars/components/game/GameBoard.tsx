'use client';

import { useGameStore } from '@/lib/game-engine/state/GameStore';
import { TurnSystem } from '@/lib/game-engine/rules/TurnSystem';
import { SimpleCard } from './Card/SimpleCard';
import { useState } from 'react';

export function GameBoard() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Subscribe to individual state slices to avoid infinite loop
  const players = useGameStore((state) => state.players);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayer);
  const lanes = useGameStore((state) => state.lanes);
  const phase = useGameStore((state) => state.phase);
  const turn = useGameStore((state) => state.turn);
  const gameOver = useGameStore((state) => state.gameOver);
  const winner = useGameStore((state) => state.winner);

  const playCard = useGameStore((state) => state.playCard);
  const endTurn = useGameStore((state) => state.endTurn);
  const resetGame = useGameStore((state) => state.resetGame);

  const currentPlayer = players[currentPlayerIndex];
  const opponent = players[currentPlayerIndex === 0 ? 1 : 0];

  // Handle card click from hand
  const handleCardClick = (cardId: string) => {
    console.log('Card clicked:', cardId);
    if (selectedCard === cardId) {
      setSelectedCard(null);
    } else {
      setSelectedCard(cardId);
    }
  };

  // Handle lane click to play card
  const handleLaneClick = (laneIndex: number) => {
    console.log('Lane clicked:', laneIndex, 'Selected card:', selectedCard);
    if (selectedCard) {
      playCard(currentPlayer.id, selectedCard, laneIndex);
      setSelectedCard(null);
    }
  };

  // End turn button
  const handleEndTurn = () => {
    console.log('End turn clicked');
    endTurn();
  };

  // Check for game over
  if (gameOver) {
    return (
      <div className="h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-strong rounded-lg p-8 text-center max-w-md">
          <h1 className="text-3xl font-bold mb-3 text-ibm-cyan">Game Over</h1>
          <p className="text-xl mb-4">
            {winner !== null
              ? `${players[winner].name} Wins!`
              : "Draw!"}
          </p>
          <button
            onClick={() => resetGame()}
            className="glass px-6 py-2 rounded font-bold text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto p-2">
        <div className="max-w-[1400px] mx-auto space-y-2">

          {/* Opponent Section - Compact */}
          <div className="glass rounded p-2 flex justify-between items-center text-sm">
            <div>
              <div className="font-bold">{opponent.name}</div>
              <div className="text-xs opacity-70">Turn {Math.ceil(turn / 2)}</div>
            </div>
            <div className="flex gap-2">
              <div className="glass px-2 py-1 rounded text-center">
                <div className="text-[10px] opacity-70">HP</div>
                <div className="font-bold text-health">{opponent.health}</div>
              </div>
              <div className="glass px-2 py-1 rounded text-center">
                <div className="text-[10px] opacity-70">Deck</div>
                <div className="font-bold">{opponent.deck.length}</div>
              </div>
            </div>
          </div>

          {/* Opponent Hand - Very Compact */}
          <div className="flex gap-1 justify-center">
            {opponent.hand.map((_, i) => (
              <div key={i} className="w-12 h-16 glass rounded bg-card-frame" />
            ))}
          </div>

          {/* Board - 4 Lanes - Optimized Size */}
          <div className="glass-strong rounded-lg p-2">
            <div className="grid grid-cols-4 gap-2">
              {lanes.map((lane, laneIndex) => (
                <div
                  key={laneIndex}
                  className={`
                    glass rounded p-2 h-[280px] flex flex-col justify-between
                    ${selectedCard ? 'cursor-pointer hover:bg-ibm-cyan/10 border border-dashed border-ibm-cyan/50' : ''}
                  `}
                  onClick={() => selectedCard && handleLaneClick(laneIndex)}
                >
                  <div className="text-[10px] text-center opacity-50 mb-1">
                    Lane {laneIndex + 1}
                  </div>

                  {/* Opponent's card */}
                  <div className="flex justify-center mb-1">
                    {lane.cards[currentPlayerIndex === 0 ? 1 : 0] ? (
                      <SimpleCard
                        card={lane.cards[currentPlayerIndex === 0 ? 1 : 0]!}
                        size="small"
                      />
                    ) : (
                      <div className="w-20 h-28 border border-dashed border-foreground/20 rounded flex items-center justify-center text-[10px] opacity-30">
                        Empty
                      </div>
                    )}
                  </div>

                  <div className="border-t border-foreground/20" />

                  {/* Current player's card */}
                  <div className="flex justify-center mt-1">
                    {lane.cards[currentPlayerIndex] ? (
                      <SimpleCard
                        card={lane.cards[currentPlayerIndex]!}
                        size="small"
                      />
                    ) : (
                      <div className="w-20 h-28 border border-dashed border-ibm-cyan/30 rounded flex items-center justify-center text-[10px] text-ibm-cyan/50">
                        {selectedCard ? 'Play' : 'Empty'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Player Section - Compact */}
          <div className="glass rounded p-2 flex justify-between items-center border border-ibm-cyan text-sm">
            <div>
              <div className="font-bold text-ibm-cyan">{currentPlayer.name}</div>
              <div className="text-xs opacity-70 capitalize">{phase}</div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="glass px-2 py-1 rounded text-center">
                <div className="text-[10px] opacity-70">HP</div>
                <div className="font-bold text-health">{currentPlayer.health}</div>
              </div>
              <div className="glass px-2 py-1 rounded text-center">
                <div className="text-[10px] opacity-70">Mana</div>
                <div className="font-bold text-mana">
                  {currentPlayer.currentMana}/{currentPlayer.maxMana}
                </div>
              </div>
              <div className="glass px-2 py-1 rounded text-center">
                <div className="text-[10px] opacity-70">Deck</div>
                <div className="font-bold">{currentPlayer.deck.length}</div>
              </div>
              <button
                onClick={handleEndTurn}
                className="glass px-4 py-2 rounded font-bold text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-colors border border-ibm-cyan"
              >
                End Turn
              </button>
            </div>
          </div>

          {/* Hand - Compact */}
          <div className="flex gap-1 justify-center pb-2">
            {currentPlayer.hand.map((card, idx) => {
              const isPlayable = currentPlayer.currentMana >= card.cost && card.type === 'employee';
              const isSelected = selectedCard === card.id;

              return (
                <div
                  key={`${card.id}-${idx}`}
                  className={`transition-transform ${isSelected ? 'scale-110 -translate-y-2' : ''}`}
                >
                  <SimpleCard
                    card={card}
                    onClick={() => isPlayable && handleCardClick(card.id)}
                    isPlayable={isPlayable}
                    isInHand
                    size="small"
                    className={isSelected ? 'ring-2 ring-ibm-cyan shadow-lg shadow-ibm-cyan/50' : ''}
                  />
                </div>
              );
            })}
          </div>

          {selectedCard && (
            <div className="text-center text-ibm-cyan text-xs animate-pulse">
              Click a lane to play this card
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
