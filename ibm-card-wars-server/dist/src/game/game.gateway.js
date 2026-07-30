"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const ws_jwt_guard_1 = require("../auth/ws-jwt.guard");
const game_service_1 = require("./game.service");
const matchmaking_service_1 = require("./matchmaking.service");
const prisma_service_1 = require("../utils/prisma.service");
let GameGateway = class GameGateway {
    gameService;
    matchmakingService;
    prisma;
    server;
    activeMatches = new Map();
    socketToMatch = new Map();
    constructor(gameService, matchmakingService, prisma) {
        this.gameService = gameService;
        this.matchmakingService = matchmakingService;
        this.prisma = prisma;
    }
    async handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
        const token = client.handshake?.auth?.token;
        if (!token) {
            console.log(`Client ${client.id} disconnected: no token`);
            client.disconnect();
            return;
        }
        try {
            console.log(`Client ${client.id} authenticated`);
        }
        catch (error) {
            console.log(`Client ${client.id} disconnected: invalid token`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        if (client.data.userId) {
            this.matchmakingService.leaveQueue(client.data.userId);
        }
        const matchId = this.socketToMatch.get(client.id);
        if (matchId) {
            this.handleMatchDisconnect(matchId, client.id);
        }
    }
    async handleJoinQueue(client, data) {
        const userId = client.data.userId;
        if (!userId) {
            client.emit('game:error', { error: 'Not authenticated' });
            return;
        }
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            client.emit('game:error', { error: 'Profile not found' });
            return;
        }
        const deck = await this.prisma.deck.findFirst({
            where: { id: data.deckId, userId },
        });
        if (!deck) {
            client.emit('game:error', { error: 'Deck not found or not owned' });
            return;
        }
        this.matchmakingService.joinQueue({
            userId,
            socketId: client.id,
            mmr: profile.mmr,
            deckId: data.deckId,
            joinedAt: Date.now(),
        });
        const match = this.matchmakingService.findMatch(userId);
        if (match) {
            await this.startMatch(match);
        }
    }
    handleLeaveQueue(client) {
        const userId = client.data.userId;
        if (userId) {
            this.matchmakingService.leaveQueue(userId);
        }
    }
    async handleGameAction(client, data) {
        const userId = client.data.userId;
        if (!userId) {
            client.emit('game:error', { error: 'Not authenticated' });
            return;
        }
        const result = await this.gameService.executeAction(data.matchId, userId, data.action);
        if (!result.success) {
            client.emit('game:error', { error: result.error });
            return;
        }
        const matchInfo = this.activeMatches.get(data.matchId);
        if (!matchInfo)
            return;
        const player1State = this.gameService.filterStateForPlayer(result.newState, matchInfo.player1Id);
        const player2State = this.gameService.filterStateForPlayer(result.newState, matchInfo.player2Id);
        this.server.to(matchInfo.player1SocketId).emit('game:state', player1State);
        this.server.to(matchInfo.player2SocketId).emit('game:state', player2State);
        if (result.newState.gameOver) {
            await this.handleGameOver(data.matchId, result.newState);
        }
    }
    async handleReconnect(client, data) {
        const userId = client.data.userId;
        if (!userId) {
            client.emit('game:error', { error: 'Not authenticated' });
            return;
        }
        const state = await this.gameService.getGameState(data.matchId, userId);
        if (!state) {
            client.emit('game:error', { error: 'Match not found or expired' });
            return;
        }
        const matchInfo = this.activeMatches.get(data.matchId);
        if (matchInfo) {
            if (matchInfo.player1Id === userId) {
                matchInfo.player1SocketId = client.id;
            }
            else if (matchInfo.player2Id === userId) {
                matchInfo.player2SocketId = client.id;
            }
            this.socketToMatch.set(client.id, data.matchId);
        }
        client.emit('game:state', state);
        if (matchInfo) {
            const opponentSocketId = matchInfo.player1Id === userId
                ? matchInfo.player2SocketId
                : matchInfo.player1SocketId;
            this.server.to(opponentSocketId).emit('opponent:reconnected');
        }
    }
    async handleForfeit(client, data) {
        const userId = client.data.userId;
        if (!userId)
            return;
        const matchInfo = this.activeMatches.get(data.matchId);
        if (!matchInfo)
            return;
        const winnerId = matchInfo.player1Id === userId ? matchInfo.player2Id : matchInfo.player1Id;
        const stats = await this.gameService.calculateGameOverStats(data.matchId, winnerId, matchInfo.startTime);
        this.server.to(matchInfo.player1SocketId).emit('game:over', {
            ...stats,
            reason: 'forfeit',
        });
        this.server.to(matchInfo.player2SocketId).emit('game:over', {
            ...stats,
            reason: 'forfeit',
        });
        await this.gameService.endMatch(data.matchId, winnerId, matchInfo.startTime);
        await this.gameService.createMatchRecord(data.matchId, matchInfo.player1Id, matchInfo.player2Id, matchInfo.deck1Id, matchInfo.deck2Id, winnerId, stats.duration, 0);
        this.activeMatches.delete(data.matchId);
        this.socketToMatch.delete(matchInfo.player1SocketId);
        this.socketToMatch.delete(matchInfo.player2SocketId);
    }
    async startMatch(matchPair) {
        const { player1, player2 } = matchPair;
        const { matchId, initialState } = await this.gameService.createMatch(player1.userId, player2.userId, player1.deckId, player2.deckId);
        this.activeMatches.set(matchId, {
            player1Id: player1.userId,
            player2Id: player2.userId,
            player1SocketId: player1.socketId,
            player2SocketId: player2.socketId,
            deck1Id: player1.deckId,
            deck2Id: player2.deckId,
            startTime: Date.now(),
        });
        this.socketToMatch.set(player1.socketId, matchId);
        this.socketToMatch.set(player2.socketId, matchId);
        const [user1, user2, profile1, profile2] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: player1.userId } }),
            this.prisma.user.findUnique({ where: { id: player2.userId } }),
            this.prisma.profile.findUnique({ where: { userId: player1.userId } }),
            this.prisma.profile.findUnique({ where: { userId: player2.userId } }),
        ]);
        const player1State = this.gameService.filterStateForPlayer(initialState, player1.userId);
        this.server.to(player1.socketId).emit('match:found', {
            matchId,
            opponent: {
                id: player2.userId,
                name: user2?.name || 'Player 2',
                rank: profile2?.rank || 'bronze',
                mmr: profile2?.mmr || 1000,
            },
            playerSlot: 0,
            initialState: player1State,
        });
        const player2State = this.gameService.filterStateForPlayer(initialState, player2.userId);
        this.server.to(player2.socketId).emit('match:found', {
            matchId,
            opponent: {
                id: player1.userId,
                name: user1?.name || 'Player 1',
                rank: profile1?.rank || 'bronze',
                mmr: profile1?.mmr || 1000,
            },
            playerSlot: 1,
            initialState: player2State,
        });
        console.log(`Match ${matchId} started between ${player1.userId} and ${player2.userId}`);
    }
    async handleGameOver(matchId, finalState) {
        const matchInfo = this.activeMatches.get(matchId);
        if (!matchInfo)
            return;
        const winnerId = finalState.winner === 0 ? matchInfo.player1Id : matchInfo.player2Id;
        const stats = await this.gameService.calculateGameOverStats(matchId, winnerId, matchInfo.startTime);
        this.server.to(matchInfo.player1SocketId).emit('game:over', stats);
        this.server.to(matchInfo.player2SocketId).emit('game:over', stats);
        await this.gameService.endMatch(matchId, winnerId, matchInfo.startTime);
        await this.gameService.createMatchRecord(matchId, matchInfo.player1Id, matchInfo.player2Id, matchInfo.deck1Id, matchInfo.deck2Id, winnerId, stats.duration, finalState.turn);
        this.activeMatches.delete(matchId);
        this.socketToMatch.delete(matchInfo.player1SocketId);
        this.socketToMatch.delete(matchInfo.player2SocketId);
    }
    handleMatchDisconnect(matchId, socketId) {
        const matchInfo = this.activeMatches.get(matchId);
        if (!matchInfo)
            return;
        const opponentSocketId = matchInfo.player1SocketId === socketId
            ? matchInfo.player2SocketId
            : matchInfo.player1SocketId;
        this.server.to(opponentSocketId).emit('opponent:disconnected');
        console.log(`Player disconnected from match ${matchId}`);
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)('queue:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleJoinQueue", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)('queue:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleLeaveQueue", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)('game:action'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleGameAction", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)('game:reconnect'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleReconnect", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)('game:forfeit'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleForfeit", null);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: 'http://localhost:3000',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [game_service_1.GameService,
        matchmaking_service_1.MatchmakingService,
        prisma_service_1.PrismaService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map