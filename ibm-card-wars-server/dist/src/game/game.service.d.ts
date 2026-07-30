import { PrismaService } from '../utils/prisma.service';
import { RedisService } from '../redis/redis.service';
import { GameState, GameAction, ActionResult } from '../game-engine/types';
export declare class GameService {
    private prisma;
    private redis;
    private engines;
    constructor(prisma: PrismaService, redis: RedisService);
    createMatch(player1Id: string, player2Id: string, deck1Id: string, deck2Id: string): Promise<{
        matchId: string;
        initialState: GameState;
    }>;
    executeAction(matchId: string, userId: string, action: GameAction): Promise<ActionResult & {
        newState?: GameState;
    }>;
    getGameState(matchId: string, userId: string): Promise<GameState | null>;
    endMatch(matchId: string, winnerId: string, startTime: number): Promise<void>;
    createMatchRecord(matchId: string, player1Id: string, player2Id: string, deck1Id: string, deck2Id: string, winnerId: string, duration: number, turns: number): Promise<void>;
    filterStateForPlayer(state: GameState, playerId: string): GameState;
    calculateGameOverStats(matchId: string, winnerId: string, startTime: number): Promise<{
        winner: 0 | 1;
        reason: 'health' | 'disconnect' | 'forfeit';
        duration: number;
        xpGained: number;
        mmrChange: number;
    }>;
}
