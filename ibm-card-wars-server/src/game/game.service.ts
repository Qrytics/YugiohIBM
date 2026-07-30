import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ServerGameEngine } from '../game-engine/ServerGameEngine';
import { GameState, GameAction, ActionResult, Card } from '../game-engine/types';
import { getCardById } from '../cards/cardDatabase';
import { createId } from '@paralleldrive/cuid2';

@Injectable()
export class GameService {
  private engines: Map<string, ServerGameEngine> = new Map();

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Create a new match
   */
  async createMatch(
    player1Id: string,
    player2Id: string,
    deck1Id: string,
    deck2Id: string,
  ): Promise<{ matchId: string; initialState: GameState }> {
    const matchId = createId();

    // Load decks from database
    const [deck1Record, deck2Record] = await Promise.all([
      this.prisma.deck.findUnique({ where: { id: deck1Id } }),
      this.prisma.deck.findUnique({ where: { id: deck2Id } }),
    ]);

    if (!deck1Record || !deck2Record) {
      throw new Error('Deck not found');
    }

    // Parse card IDs and load cards
    const deck1CardIds = JSON.parse(deck1Record.cardIds);
    const deck2CardIds = JSON.parse(deck2Record.cardIds);

    const deck1Cards: Card[] = deck1CardIds
      .map((id: string) => getCardById(id))
      .filter((c: Card | undefined): c is Card => c !== undefined);
    const deck2Cards: Card[] = deck2CardIds
      .map((id: string) => getCardById(id))
      .filter((c: Card | undefined): c is Card => c !== undefined);

    // Get player names
    const [user1, user2] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: player1Id } }),
      this.prisma.user.findUnique({ where: { id: player2Id } }),
    ]);

    const player1Name = user1?.name || 'Player 1';
    const player2Name = user2?.name || 'Player 2';

    // Create game engine with seed
    const seed = `${matchId}-${Date.now()}`;
    const engine = new ServerGameEngine(seed);

    // Initialize game
    const initialState = engine.initGame(
      player1Id,
      player1Name,
      deck1Cards,
      player2Id,
      player2Name,
      deck2Cards,
    );

    // Store engine and state
    this.engines.set(matchId, engine);
    await this.redis.setGameState(matchId, initialState);

    return { matchId, initialState };
  }

  /**
   * Execute a game action
   */
  async executeAction(
    matchId: string,
    userId: string,
    action: GameAction,
  ): Promise<ActionResult & { newState?: GameState }> {
    // Get engine
    let engine = this.engines.get(matchId);

    // If not in memory, can't execute (state expired)
    if (!engine) {
      // Try to recreate from Redis
      const state = await this.redis.getGameState(matchId);
      if (!state) {
        return {
          success: false,
          error: 'Match not found or expired',
        };
      }

      // Create new engine (no seed needed for action execution)
      engine = new ServerGameEngine(`${matchId}-recovered`);
      this.engines.set(matchId, engine);
    }

    // Get current state
    const state = await this.redis.getGameState(matchId);
    if (!state) {
      return {
        success: false,
        error: 'Match state not found',
      };
    }

    // Execute action
    const result = engine.executeAction(state, action);

    if (!result.success) {
      return result;
    }

    // Update Redis
    await this.redis.setGameState(matchId, state);

    return {
      ...result,
      newState: state,
    };
  }

  /**
   * Get game state (filtered for player)
   */
  async getGameState(matchId: string, userId: string): Promise<GameState | null> {
    const state = await this.redis.getGameState(matchId);
    if (!state) return null;

    return this.filterStateForPlayer(state, userId);
  }

  /**
   * End a match
   */
  async endMatch(matchId: string, winnerId: string, startTime: number): Promise<void> {
    const state = await this.redis.getGameState(matchId);
    if (!state) return;

    const duration = Math.floor((Date.now() - startTime) / 1000); // seconds
    const turns = state.turn;

    const player1Id = state.players[0].id;
    const player2Id = state.players[1].id;

    // Determine winner/loser
    const winnerIndex = state.players.findIndex((p) => p.id === winnerId);
    const loserIndex = winnerIndex === 0 ? 1 : 0;

    const winnerProfile = await this.prisma.profile.findUnique({
      where: { userId: winnerId },
    });
    const loserId = state.players[loserIndex].id;
    const loserProfile = await this.prisma.profile.findUnique({
      where: { userId: loserId },
    });

    if (!winnerProfile || !loserProfile) {
      console.error('Profile not found for winner or loser');
      return;
    }

    // Calculate MMR change (ELO system)
    const K = 32;
    const expectedScoreWinner =
      1 / (1 + 10 ** ((loserProfile.mmr - winnerProfile.mmr) / 400));
    const mmrChange = Math.round(K * (1 - expectedScoreWinner));

    // Calculate XP
    const baseXP = 50;
    const winBonus = 100;
    const turnBonus = Math.min(turns * 5, 100);
    const winnerXP = baseXP + winBonus + turnBonus;
    const loserXP = baseXP + turnBonus;

    // Update profiles and get updated values
    const [updatedWinnerProfile, updatedLoserProfile] = await Promise.all([
      this.prisma.profile.update({
        where: { userId: winnerId },
        data: {
          wins: { increment: 1 },
          xp: { increment: winnerXP },
          mmr: { increment: mmrChange },
        },
      }),
      this.prisma.profile.update({
        where: { userId: loserId },
        data: {
          losses: { increment: 1 },
          xp: { increment: loserXP },
          mmr: { decrement: mmrChange },
        },
      }),
    ]);

    // CHECK FOR LEVEL UPS AND AWARD REWARDS
    await this.handleLevelUp(winnerId, winnerProfile.xp, updatedWinnerProfile.xp);
    await this.handleLevelUp(loserId, loserProfile.xp, updatedLoserProfile.xp);

    // CHECK FOR RANK CHANGES
    await this.handleRankChange(winnerId, updatedWinnerProfile.mmr);
    await this.handleRankChange(loserId, updatedLoserProfile.mmr);

    // UPDATE MISSION PROGRESS
    await this.updateMissionProgress(winnerId, 'play', 1);
    await this.updateMissionProgress(winnerId, 'win', 1);
    await this.updateMissionProgress(loserId, 'play', 1);

    // Find deck IDs (we need to store this at match creation)
    // For now, we'll handle this in the gateway where we have access to deck IDs

    // Clean up
    await this.redis.deleteGameState(matchId);
    this.engines.delete(matchId);
  }

  /**
   * Update mission progress for a user
   */
  private async updateMissionProgress(
    userId: string,
    actionType: 'play' | 'win',
    amount: number,
  ): Promise<void> {
    try {
      // Find all active uncompleted missions for this user
      const activeMissions = await this.prisma.mission.findMany({
        where: {
          userId,
          completed: false,
          expiresAt: { gt: new Date() },
        },
      });

      // Update progress based on action type
      for (const mission of activeMissions) {
        let shouldUpdate = false;

        // Check if mission matches action type
        if (actionType === 'play' && mission.missionId.includes('play')) {
          shouldUpdate = true;
        } else if (actionType === 'win' && mission.missionId.includes('win')) {
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          const newProgress = mission.progress + amount;
          const completed = newProgress >= mission.goal;

          await this.prisma.mission.update({
            where: { id: mission.id },
            data: {
              progress: Math.min(newProgress, mission.goal),
              completed,
            },
          });

          if (completed) {
            console.log(`Mission ${mission.missionId} completed for user ${userId}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to update mission progress:', error);
      // Don't throw - mission tracking is non-critical
    }
  }

  /**
   * Handle level up and award rewards
   */
  private async handleLevelUp(
    userId: string,
    oldXP: number,
    newXP: number,
  ): Promise<void> {
    // Simple level calculation (level * 100 XP per level)
    const getLevelFromXP = (xp: number): number => {
      if (xp < 0) return 1;
      for (let level = 1; level <= 50; level++) {
        const xpForNextLevel = (level * (level + 1) / 2) * 100;
        if (xp < xpForNextLevel) return level;
      }
      return 50;
    };

    const oldLevel = getLevelFromXP(oldXP);
    const newLevel = getLevelFromXP(newXP);

    if (newLevel > oldLevel) {
      // Update level in database
      await this.prisma.profile.update({
        where: { userId },
        data: { level: newLevel },
      });

      // Award packs for each level gained
      const levelRewards: Record<number, { packType: string; quantity: number }[]> = {
        2: [{ packType: 'standard', quantity: 1 }],
        3: [{ packType: 'standard', quantity: 1 }],
        4: [{ packType: 'standard', quantity: 1 }],
        5: [{ packType: 'rare', quantity: 1 }],
        10: [{ packType: 'rare', quantity: 2 }],
        15: [{ packType: 'rare', quantity: 2 }],
        20: [{ packType: 'epic', quantity: 1 }],
        25: [{ packType: 'rare', quantity: 3 }],
        30: [{ packType: 'epic', quantity: 2 }],
        40: [{ packType: 'epic', quantity: 3 }],
        50: [{ packType: 'epic', quantity: 5 }],
      };

      for (let level = oldLevel + 1; level <= newLevel; level++) {
        const rewards = levelRewards[level];
        if (rewards) {
          for (const reward of rewards) {
            for (let i = 0; i < reward.quantity; i++) {
              await this.prisma.pack.create({
                data: {
                  userId,
                  type: reward.packType,
                  source: `level_${level}`,
                },
              });
            }
          }
        }
      }

      console.log(`Player ${userId} leveled up from ${oldLevel} to ${newLevel}`);
    }
  }

  /**
   * Handle rank changes based on MMR
   */
  private async handleRankChange(userId: string, mmr: number): Promise<void> {
    // Get rank from MMR
    const getRankFromMMR = (mmr: number): string => {
      if (mmr >= 3500) return 'grandmaster';
      if (mmr >= 3000) return 'master';
      if (mmr >= 2500) return 'diamond';
      if (mmr >= 2000) return 'platinum';
      if (mmr >= 1500) return 'gold';
      if (mmr >= 1000) return 'silver';
      return 'bronze';
    };

    const newRank = getRankFromMMR(mmr);

    // Get current rank
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { rank: true },
    });

    if (profile && profile.rank !== newRank) {
      await this.prisma.profile.update({
        where: { userId },
        data: { rank: newRank },
      });
      console.log(`Player ${userId} rank changed to ${newRank} (MMR: ${mmr})`);
    }
  }

  /**
   * Create match record in database
   */
  async createMatchRecord(
    matchId: string,
    player1Id: string,
    player2Id: string,
    deck1Id: string,
    deck2Id: string,
    winnerId: string,
    duration: number,
    turns: number,
  ): Promise<void> {
    await this.prisma.match.create({
      data: {
        id: matchId,
        player1Id,
        player2Id,
        deck1Id,
        deck2Id,
        winnerId,
        duration,
        turns,
        replayData: null, // Can store full history here if needed
      },
    });
  }

  /**
   * Filter game state for a specific player
   * Hides opponent's hand and deck order
   */
  filterStateForPlayer(state: GameState, playerId: string): GameState {
    const playerIndex = state.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return state;

    const opponentIndex = playerIndex === 0 ? 1 : 0;
    const filteredState = JSON.parse(JSON.stringify(state)); // Deep clone

    // Hide opponent's hand (show count only)
    const opponent = filteredState.players[opponentIndex];
    const handCount = opponent.hand.length;
    opponent.hand = Array(handCount).fill({
      id: 'hidden',
      name: 'Hidden Card',
      cost: 0,
      type: 'employee',
      rarity: 'common',
      profession: 'neutral',
      description: '',
      flavorText: '',
      artUrl: '',
      keywords: [],
    });

    // Hide opponent's deck (show count only)
    const deckCount = opponent.deck.length;
    opponent.deck = Array(deckCount).fill({
      id: 'hidden',
      name: 'Hidden Card',
      cost: 0,
      type: 'employee',
      rarity: 'common',
      profession: 'neutral',
      description: '',
      flavorText: '',
      artUrl: '',
      keywords: [],
    });

    return filteredState;
  }

  /**
   * Calculate statistics for game over event
   */
  async calculateGameOverStats(
    matchId: string,
    winnerId: string,
    startTime: number,
  ): Promise<{
    winner: 0 | 1;
    reason: 'health' | 'disconnect' | 'forfeit';
    duration: number;
    xpGained: number;
    mmrChange: number;
  }> {
    const state = await this.redis.getGameState(matchId);
    if (!state) {
      throw new Error('Match state not found');
    }

    const winnerIndex = state.players.findIndex((p) => p.id === winnerId) as 0 | 1;
    const loserIndex = (winnerIndex === 0 ? 1 : 0) as 0 | 1;
    const loserId = state.players[loserIndex].id;

    const [winnerProfile, loserProfile] = await Promise.all([
      this.prisma.profile.findUnique({ where: { userId: winnerId } }),
      this.prisma.profile.findUnique({ where: { userId: loserId } }),
    ]);

    // Calculate MMR
    const K = 32;
    const expectedScore = 1 / (1 + 10 ** ((loserProfile!.mmr - winnerProfile!.mmr) / 400));
    const mmrChange = Math.round(K * (1 - expectedScore));

    // Calculate XP
    const baseXP = 50;
    const winBonus = 100;
    const turnBonus = Math.min(state.turn * 5, 100);
    const xpGained = baseXP + winBonus + turnBonus;

    // Calculate duration
    const duration = Math.floor((Date.now() - startTime) / 1000);

    return {
      winner: winnerIndex,
      reason: 'health',
      duration,
      xpGained,
      mmrChange,
    };
  }
}
