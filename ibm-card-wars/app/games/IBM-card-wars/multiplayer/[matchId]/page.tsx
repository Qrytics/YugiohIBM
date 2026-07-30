'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getSocketManager, type GameOverData } from '@/lib/multiplayer/SocketManager';
import { GameBoard } from '@/components/game/GameBoard';
import type { GameState } from '@/lib/game-engine/types';
import { useGameStore } from '@/lib/game-engine/state/GameStore';

export default function MultiplayerGamePage({ params }: { params: Promise<{ matchId: string }> }) {
  const resolvedParams = use(params);
  const { matchId } = resolvedParams;
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerSlot, setPlayerSlot] = useState<0 | 1>(0);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);

  // Get game store actions
  const { setState } = useGameStore();

  useEffect(() => {
    const socketManager = getSocketManager();

    // If not connected, redirect to queue
    if (!socketManager.isConnected) {
      router.push('/games/IBM-card-wars/multiplayer/queue');
      return;
    }

    // Try to reconnect to match
    socketManager.reconnect(matchId);

    // Handle game state updates
    const handleGameState = (state: GameState) => {
      setLoading(false);
      setState(state);
    };

    // Handle game errors
    const handleError = ({ error }: { error: string }) => {
      setError(error);
      setLoading(false);
    };

    // Handle game over
    const handleGameOver = (data: GameOverData) => {
      setGameOver(true);
      setGameOverData(data);
    };

    // Handle opponent disconnection
    const handleOpponentDisconnected = () => {
      setOpponentDisconnected(true);
    };

    const handleOpponentReconnected = () => {
      setOpponentDisconnected(false);
    };

    // Register handlers
    socketManager.on('game:state', handleGameState);
    socketManager.on('game:error', handleError);
    socketManager.on('game:over', handleGameOver);
    socketManager.on('opponent:disconnected', handleOpponentDisconnected);
    socketManager.on('opponent:reconnected', handleOpponentReconnected);

    // Cleanup
    return () => {
      socketManager.off('game:state', handleGameState);
      socketManager.off('game:error', handleError);
      socketManager.off('game:over', handleGameOver);
      socketManager.off('opponent:disconnected', handleOpponentDisconnected);
      socketManager.off('opponent:reconnected', handleOpponentReconnected);
    };
  }, [matchId, router, setState]);

  const handleForfeit = () => {
    if (confirm('Are you sure you want to forfeit this match?')) {
      const socketManager = getSocketManager();
      socketManager.forfeit();
      router.push('/games/IBM-card-wars');
    }
  };

  const handleReturnToMenu = () => {
    router.push('/games/IBM-card-wars');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-strong rounded-xl p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-ibm-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading Match...</h2>
          <p className="text-foreground/70">Connecting to game</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-strong rounded-xl p-8 max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-error-red/20 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-error-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-error-red">Error</h2>
          <p className="text-foreground/70 mb-6">{error}</p>
          <button
            onClick={handleReturnToMenu}
            className="px-6 py-3 rounded-lg glass-strong border border-ibm-cyan text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-colors font-medium"
          >
            Return to Menu
          </button>
        </div>
      </div>
    );
  }

  if (gameOver && gameOverData) {
    const didWin = gameOverData.winner === playerSlot;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-strong rounded-xl p-8 max-w-md text-center">
          <div
            className={`h-24 w-24 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl ${
              didWin ? 'bg-success-green/20' : 'bg-error-red/20'
            }`}
          >
            {didWin ? '🏆' : '💔'}
          </div>

          <h2 className={`text-3xl font-bold mb-4 ${didWin ? 'text-success-green' : 'text-error-red'}`}>
            {didWin ? 'Victory!' : 'Defeat'}
          </h2>

          <div className="glass rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-foreground/70">Reason:</span>
              <span className="font-bold capitalize">{gameOverData.reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/70">Duration:</span>
              <span className="font-bold">{Math.floor(gameOverData.duration / 60)}m {gameOverData.duration % 60}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/70">XP Gained:</span>
              <span className="font-bold text-ibm-cyan">+{gameOverData.xpGained}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/70">MMR Change:</span>
              <span className={`font-bold ${gameOverData.mmrChange >= 0 ? 'text-success-green' : 'text-error-red'}`}>
                {gameOverData.mmrChange >= 0 ? '+' : ''}{gameOverData.mmrChange}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/games/IBM-card-wars/multiplayer/queue')}
              className="flex-1 px-6 py-3 rounded-lg glass-strong border border-ibm-cyan text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-colors font-medium"
            >
              Play Again
            </button>
            <button
              onClick={handleReturnToMenu}
              className="flex-1 px-6 py-3 rounded-lg glass-strong border border-foreground/20 text-foreground/70 hover:border-ibm-cyan hover:text-ibm-cyan transition-colors font-medium"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      {/* Opponent Disconnected Overlay */}
      {opponentDisconnected && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 glass-strong rounded-lg px-6 py-3 border border-warning-yellow animate-pulse">
          <div className="flex items-center gap-2 text-warning-yellow">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-bold">Opponent Disconnected</span>
          </div>
          <div className="text-xs text-warning-yellow/70 mt-1">Waiting for reconnection (30s timeout)...</div>
        </div>
      )}

      {/* Forfeit Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleForfeit}
          className="px-4 py-2 rounded-lg glass-strong border border-error-red text-error-red hover:bg-error-red hover:text-white transition-colors font-medium text-sm"
        >
          Forfeit
        </button>
      </div>

      {/* Game Board */}
      <GameBoard mode="multiplayer" />
    </div>
  );
}
