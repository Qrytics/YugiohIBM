import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully');
    });

    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * Store game state in Redis with 5-minute TTL
   */
  async setGameState(matchId: string, state: any): Promise<void> {
    const key = `game:${matchId}`;
    await this.client.setEx(key, 300, JSON.stringify(state)); // 300 seconds = 5 minutes
  }

  /**
   * Retrieve game state from Redis
   */
  async getGameState(matchId: string): Promise<any | null> {
    const key = `game:${matchId}`;
    const data = await this.client.get(key);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to parse game state for match ${matchId}:`, error);
      return null;
    }
  }

  /**
   * Delete game state from Redis (cleanup after game ends)
   */
  async deleteGameState(matchId: string): Promise<void> {
    const key = `game:${matchId}`;
    await this.client.del(key);
  }

  /**
   * Check if a game state exists in Redis
   */
  async gameStateExists(matchId: string): Promise<boolean> {
    const key = `game:${matchId}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  /**
   * Extend TTL of game state (e.g., on reconnection)
   */
  async extendGameStateTTL(matchId: string): Promise<void> {
    const key = `game:${matchId}`;
    await this.client.expire(key, 300); // Reset to 5 minutes
  }
}
