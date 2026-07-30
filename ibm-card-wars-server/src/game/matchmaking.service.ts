import { Injectable } from '@nestjs/common';

export interface QueueEntry {
  userId: string;
  socketId: string;
  mmr: number;
  deckId: string;
  joinedAt: number;
}

export interface MatchPair {
  player1: QueueEntry;
  player2: QueueEntry;
}

@Injectable()
export class MatchmakingService {
  private queue: Map<string, QueueEntry> = new Map();

  /**
   * Add player to matchmaking queue
   */
  joinQueue(entry: QueueEntry): void {
    this.queue.set(entry.userId, entry);
    console.log(`Player ${entry.userId} joined queue (MMR: ${entry.mmr})`);
  }

  /**
   * Remove player from queue
   */
  leaveQueue(userId: string): void {
    const entry = this.queue.get(userId);
    if (entry) {
      this.queue.delete(userId);
      console.log(`Player ${userId} left queue`);
    }
  }

  /**
   * Find a match for a player
   * Returns null if no suitable opponent found
   */
  findMatch(userId: string): MatchPair | null {
    const user = this.queue.get(userId);
    if (!user) return null;

    // Calculate MMR range (expands over time)
    const timeSinceJoin = Date.now() - user.joinedAt;
    const initialRange = 50;
    const maxRange = 200;
    const range = Math.min(initialRange + (timeSinceJoin / 1000) * 10, maxRange);

    // Find best opponent
    let bestOpponent: QueueEntry | null = null;
    let smallestDiff = Infinity;

    for (const [opponentId, opponent] of this.queue) {
      if (opponentId === userId) continue;

      const mmrDiff = Math.abs(opponent.mmr - user.mmr);

      if (mmrDiff <= range && mmrDiff < smallestDiff) {
        bestOpponent = opponent;
        smallestDiff = mmrDiff;
      }
    }

    if (!bestOpponent) {
      return null;
    }

    // Remove both from queue
    this.queue.delete(userId);
    this.queue.delete(bestOpponent.userId);

    console.log(
      `Match found: ${user.userId} (${user.mmr}) vs ${bestOpponent.userId} (${bestOpponent.mmr}) [diff: ${smallestDiff}]`,
    );

    return {
      player1: user,
      player2: bestOpponent,
    };
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.size;
  }

  /**
   * Get entry for a user
   */
  getEntry(userId: string): QueueEntry | undefined {
    return this.queue.get(userId);
  }

  /**
   * Check if user is in queue
   */
  isInQueue(userId: string): boolean {
    return this.queue.has(userId);
  }

  /**
   * Clear the entire queue (admin/debug use)
   */
  clearQueue(): void {
    this.queue.clear();
    console.log('Matchmaking queue cleared');
  }
}
