'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getSocketManager, type MatchFoundData } from '@/lib/multiplayer/SocketManager';
import { useRouter } from 'next/navigation';

interface MatchmakingQueueProps {
  deckId: string;
  onCancel: () => void;
}

export function MatchmakingQueue({ deckId, onCancel }: MatchmakingQueueProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<'connecting' | 'queuing' | 'found' | 'error'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [queueTime, setQueueTime] = useState(0);
  const [opponent, setOpponent] = useState<MatchFoundData['opponent'] | null>(null);

  useEffect(() => {
    const socketManager = getSocketManager();

    // Get auth token from session
    const token = (session as any)?.accessToken || 'demo-token';

    // Connect to server
    try {
      socketManager.connect(token);
    } catch (err) {
      setStatus('error');
      setError('Failed to connect to game server');
      return;
    }

    // Wait for connection
    const handleConnection = () => {
      setStatus('queuing');
      socketManager.joinQueue(deckId);
    };

    const handleMatchFound = (data: MatchFoundData) => {
      setStatus('found');
      setOpponent(data.opponent);

      // Redirect to game after 2 seconds
      setTimeout(() => {
        router.push(`/games/IBM-card-wars/multiplayer/${data.matchId}`);
      }, 2000);
    };

    const handleError = ({ error }: { error: string }) => {
      setStatus('error');
      setError(error);
    };

    const handleDisconnection = () => {
      setStatus('error');
      setError('Lost connection to server');
    };

    // Register handlers
    socketManager.on('connection', handleConnection);
    socketManager.on('match:found', handleMatchFound);
    socketManager.on('game:error', handleError);
    socketManager.on('disconnection', handleDisconnection);

    // If already connected, join queue immediately
    if (socketManager.isConnected) {
      handleConnection();
    }

    return () => {
      socketManager.off('connection', handleConnection);
      socketManager.off('match:found', handleMatchFound);
      socketManager.off('game:error', handleError);
      socketManager.off('disconnection', handleDisconnection);
    };
  }, [deckId, session, router]);

  // Queue timer
  useEffect(() => {
    if (status === 'queuing') {
      const interval = setInterval(() => {
        setQueueTime((t) => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleCancel = () => {
    const socketManager = getSocketManager();
    try {
      socketManager.leaveQueue();
      socketManager.disconnect();
    } catch (err) {
      console.error('Error cancelling queue:', err);
    }
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedWait = () => {
    if (queueTime < 10) return 'Less than 1 minute';
    if (queueTime < 30) return '1-2 minutes';
    if (queueTime < 60) return '2-3 minutes';
    return 'Finding best match...';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-strong rounded-xl p-8 max-w-md w-full text-center">
        {status === 'connecting' && (
          <>
            <div className="animate-spin h-12 w-12 border-4 border-ibm-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Connecting...</h2>
            <p className="text-foreground/70">Connecting to game server</p>
          </>
        )}

        {status === 'queuing' && (
          <>
            <div className="relative mb-6">
              <div className="animate-pulse h-24 w-24 bg-ibm-cyan/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="animate-spin h-16 w-16 border-4 border-ibm-cyan border-t-transparent rounded-full"></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">Finding Match...</h2>
            <p className="text-foreground/70 mb-4">Searching for opponent</p>

            <div className="glass rounded-lg p-4 mb-6">
              <div className="text-3xl font-bold text-ibm-cyan mb-2">{formatTime(queueTime)}</div>
              <div className="text-sm text-foreground/60">{getEstimatedWait()}</div>
            </div>

            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-lg glass-strong border border-error-red text-error-red hover:bg-error-red hover:text-white transition-colors font-medium"
            >
              Cancel Queue
            </button>
          </>
        )}

        {status === 'found' && opponent && (
          <>
            <div className="mb-6">
              <div className="h-24 w-24 bg-gradient-to-br from-ibm-cyan to-ibm-purple rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
                {opponent.name[0].toUpperCase()}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2 text-success-green">Match Found!</h2>
            <p className="text-foreground/70 mb-6">Connecting to game...</p>

            <div className="glass rounded-lg p-4 mb-4">
              <div className="text-lg font-bold mb-1">{opponent.name}</div>
              <div className="text-sm text-foreground/60">
                {opponent.rank.charAt(0).toUpperCase() + opponent.rank.slice(1)} • MMR: {opponent.mmr}
              </div>
            </div>

            <div className="text-sm text-foreground/50">Starting game...</div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="h-16 w-16 rounded-full bg-error-red/20 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-error-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold mb-2 text-error-red">Connection Error</h2>
            <p className="text-foreground/70 mb-6">{error || 'Failed to connect to game server'}</p>

            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-lg glass-strong border border-ibm-cyan text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-colors font-medium"
            >
              Return to Menu
            </button>
          </>
        )}
      </div>
    </div>
  );
}
