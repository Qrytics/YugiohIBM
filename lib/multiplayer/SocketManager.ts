/**
 * Socket.IO Client Manager for Multiplayer
 *
 * Handles WebSocket connection to game server for real-time multiplayer.
 * Note: This is a client-side wrapper. The actual Socket.IO server will be
 * implemented in Phase 5 (see PHASE_5_PLAN.md for full architecture).
 */

import { io, Socket } from 'socket.io-client';
import type { GameState, GameAction } from '@/lib/game-engine/types';

export interface MatchFoundData {
  matchId: string;
  opponent: {
    id: string;
    name: string;
    rank: string;
    mmr: number;
  };
  playerSlot: 0 | 1;  // Which player you are (0 or 1)
  initialState: GameState;
}

export interface GameOverData {
  winner: 0 | 1;
  reason: 'health' | 'disconnect' | 'forfeit';
  duration: number;
  xpGained: number;
  mmrChange: number;
}

type EventCallback<T = any> = (data: T) => void;

export class SocketManager {
  private socket: Socket | null = null;
  private matchId: string | null = null;
  private eventHandlers: Map<string, EventCallback[]> = new Map();

  /**
   * Connect to game server with authentication
   */
  connect(token: string, serverUrl = 'http://localhost:3001'): void {
    if (this.socket?.connected) {
      console.warn('Already connected to game server');
      return;
    }

    this.socket = io(serverUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to game server:', this.socket?.id);
      this.emit('connection', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from game server:', reason);
      this.emit('disconnection', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('error', { error: error.message });
    });

    // Game events
    this.setupGameEvents();
  }

  /**
   * Set up listeners for game events
   */
  private setupGameEvents(): void {
    if (!this.socket) return;

    // Match found
    this.socket.on('match:found', (data: MatchFoundData) => {
      console.log('Match found:', data);
      this.matchId = data.matchId;
      this.emit('match:found', data);
    });

    // Game state update
    this.socket.on('game:state', (state: GameState) => {
      console.log('Game state update:', state);
      this.emit('game:state', state);
    });

    // Game error
    this.socket.on('game:error', ({ error }: { error: string }) => {
      console.error('Game error:', error);
      this.emit('game:error', { error });
    });

    // Game over
    this.socket.on('game:over', (data: GameOverData) => {
      console.log('Game over:', data);
      this.emit('game:over', data);
      this.matchId = null;
    });

    // Opponent disconnected
    this.socket.on('opponent:disconnected', () => {
      console.log('Opponent disconnected');
      this.emit('opponent:disconnected', {});
    });

    // Opponent reconnected
    this.socket.on('opponent:reconnected', () => {
      console.log('Opponent reconnected');
      this.emit('opponent:reconnected', {});
    });
  }

  /**
   * Join matchmaking queue
   */
  joinQueue(deckId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }

    console.log('Joining queue with deck:', deckId);
    this.socket.emit('queue:join', { deckId });
  }

  /**
   * Leave matchmaking queue
   */
  leaveQueue(): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }

    console.log('Leaving queue');
    this.socket.emit('queue:leave');
  }

  /**
   * Send game action to server
   */
  sendAction(action: GameAction): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }

    if (!this.matchId) {
      throw new Error('No active match');
    }

    console.log('Sending action:', action);
    this.socket.emit('game:action', {
      matchId: this.matchId,
      action,
    });
  }

  /**
   * Reconnect to active match
   */
  reconnect(matchId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }

    console.log('Reconnecting to match:', matchId);
    this.matchId = matchId;
    this.socket.emit('game:reconnect', { matchId });
  }

  /**
   * Forfeit current match
   */
  forfeit(): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }

    if (!this.matchId) {
      throw new Error('No active match');
    }

    console.log('Forfeiting match');
    this.socket.emit('game:forfeit', { matchId: this.matchId });
    this.matchId = null;
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting from server');
      this.socket.disconnect();
      this.socket = null;
      this.matchId = null;
      this.eventHandlers.clear();
    }
  }

  /**
   * Register event handler
   */
  on<T = any>(event: string, callback: EventCallback<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  /**
   * Unregister event handler
   */
  off(event: string, callback: EventCallback): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to handlers
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get current match ID
   */
  get currentMatchId(): string | null {
    return this.matchId;
  }

  /**
   * Get socket ID
   */
  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

// Singleton instance
let socketManager: SocketManager | null = null;

export function getSocketManager(): SocketManager {
  if (!socketManager) {
    socketManager = new SocketManager();
  }
  return socketManager;
}
