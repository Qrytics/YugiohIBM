'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/game-engine/state/GameStore';
import { GameBoard } from '@/components/game/GameBoard';
import { getTestDeck } from '@/lib/cards/test-cards';

export default function PlayPage() {
  const [gameStarted, setGameStarted] = useState(false);
  const initGame = useGameStore((state) => state.initGame);

  const startGame = () => {
    const deck1 = getTestDeck();
    const deck2 = getTestDeck();

    initGame('Player 1', 'Player 2', deck1, deck2);
    setGameStarted(true);
  };

  if (!gameStarted) {
    return (
      <div className="h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-strong rounded-lg p-8 text-center max-w-lg">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-ibm-blue via-ibm-cyan to-ibm-purple bg-clip-text text-transparent">
              IBM Card Wars
            </span>
          </h1>

          <p className="text-foreground/80 mb-6">
            Click cards from your hand, place them in lanes, then end your turn.
            Units fight automatically. First to 0 HP loses.
          </p>

          <div className="glass p-4 rounded mb-6 text-sm text-left space-y-1 text-foreground/70">
            <div>• Mana increases each turn (max 10)</div>
            <div>• 4 lanes for unit placement</div>
            <div>• Auto-combat at turn end</div>
            <div>• 20 test cards available</div>
          </div>

          <button
            onClick={startGame}
            className="glass-strong px-8 py-4 rounded-lg font-bold text-xl text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-all border border-ibm-cyan hover:scale-105"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return <GameBoard />;
}
