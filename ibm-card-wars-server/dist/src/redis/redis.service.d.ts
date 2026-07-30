import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private client;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    setGameState(matchId: string, state: any): Promise<void>;
    getGameState(matchId: string): Promise<any | null>;
    deleteGameState(matchId: string): Promise<void>;
    gameStateExists(matchId: string): Promise<boolean>;
    extendGameStateTTL(matchId: string): Promise<void>;
}
