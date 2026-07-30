import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { MatchmakingService } from './matchmaking.service';
import { PrismaService } from '../utils/prisma.service';
import { GameAction } from '../game-engine/types';
export declare class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private gameService;
    private matchmakingService;
    private prisma;
    server: Server;
    private activeMatches;
    private socketToMatch;
    constructor(gameService: GameService, matchmakingService: MatchmakingService, prisma: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinQueue(client: Socket, data: {
        deckId: string;
    }): Promise<void>;
    handleLeaveQueue(client: Socket): void;
    handleGameAction(client: Socket, data: {
        matchId: string;
        action: GameAction;
    }): Promise<void>;
    handleReconnect(client: Socket, data: {
        matchId: string;
    }): Promise<void>;
    handleForfeit(client: Socket, data: {
        matchId: string;
    }): Promise<void>;
    private startMatch;
    private handleGameOver;
    private handleMatchDisconnect;
}
