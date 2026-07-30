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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../utils/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const ServerGameEngine_1 = require("../game-engine/ServerGameEngine");
const cardDatabase_1 = require("../cards/cardDatabase");
const cuid2_1 = require("@paralleldrive/cuid2");
let GameService = class GameService {
    prisma;
    redis;
    engines = new Map();
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async createMatch(player1Id, player2Id, deck1Id, deck2Id) {
        const matchId = (0, cuid2_1.createId)();
        const [deck1Record, deck2Record] = await Promise.all([
            this.prisma.deck.findUnique({ where: { id: deck1Id } }),
            this.prisma.deck.findUnique({ where: { id: deck2Id } }),
        ]);
        if (!deck1Record || !deck2Record) {
            throw new Error('Deck not found');
        }
        const deck1CardIds = JSON.parse(deck1Record.cardIds);
        const deck2CardIds = JSON.parse(deck2Record.cardIds);
        const deck1Cards = deck1CardIds
            .map((id) => (0, cardDatabase_1.getCardById)(id))
            .filter((c) => c !== undefined);
        const deck2Cards = deck2CardIds
            .map((id) => (0, cardDatabase_1.getCardById)(id))
            .filter((c) => c !== undefined);
        const [user1, user2] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: player1Id } }),
            this.prisma.user.findUnique({ where: { id: player2Id } }),
        ]);
        const player1Name = user1?.name || 'Player 1';
        const player2Name = user2?.name || 'Player 2';
        const seed = `${matchId}-${Date.now()}`;
        const engine = new ServerGameEngine_1.ServerGameEngine(seed);
        const initialState = engine.initGame(player1Id, player1Name, deck1Cards, player2Id, player2Name, deck2Cards);
        this.engines.set(matchId, engine);
        await this.redis.setGameState(matchId, initialState);
        return { matchId, initialState };
    }
    async executeAction(matchId, userId, action) {
        let engine = this.engines.get(matchId);
        if (!engine) {
            const state = await this.redis.getGameState(matchId);
            if (!state) {
                return {
                    success: false,
                    error: 'Match not found or expired',
                };
            }
            engine = new ServerGameEngine_1.ServerGameEngine(`${matchId}-recovered`);
            this.engines.set(matchId, engine);
        }
        const state = await this.redis.getGameState(matchId);
        if (!state) {
            return {
                success: false,
                error: 'Match state not found',
            };
        }
        const result = engine.executeAction(state, action);
        if (!result.success) {
            return result;
        }
        await this.redis.setGameState(matchId, state);
        return {
            ...result,
            newState: state,
        };
    }
    async getGameState(matchId, userId) {
        const state = await this.redis.getGameState(matchId);
        if (!state)
            return null;
        return this.filterStateForPlayer(state, userId);
    }
    async endMatch(matchId, winnerId, startTime) {
        const state = await this.redis.getGameState(matchId);
        if (!state)
            return;
        const duration = Math.floor((Date.now() - startTime) / 1000);
        const turns = state.turn;
        const player1Id = state.players[0].id;
        const player2Id = state.players[1].id;
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
        const K = 32;
        const expectedScoreWinner = 1 / (1 + 10 ** ((loserProfile.mmr - winnerProfile.mmr) / 400));
        const mmrChange = Math.round(K * (1 - expectedScoreWinner));
        const baseXP = 50;
        const winBonus = 100;
        const turnBonus = Math.min(turns * 5, 100);
        const winnerXP = baseXP + winBonus + turnBonus;
        const loserXP = baseXP + turnBonus;
        await Promise.all([
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
        await this.redis.deleteGameState(matchId);
        this.engines.delete(matchId);
    }
    async createMatchRecord(matchId, player1Id, player2Id, deck1Id, deck2Id, winnerId, duration, turns) {
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
                replayData: null,
            },
        });
    }
    filterStateForPlayer(state, playerId) {
        const playerIndex = state.players.findIndex((p) => p.id === playerId);
        if (playerIndex === -1)
            return state;
        const opponentIndex = playerIndex === 0 ? 1 : 0;
        const filteredState = JSON.parse(JSON.stringify(state));
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
    async calculateGameOverStats(matchId, winnerId, startTime) {
        const state = await this.redis.getGameState(matchId);
        if (!state) {
            throw new Error('Match state not found');
        }
        const winnerIndex = state.players.findIndex((p) => p.id === winnerId);
        const loserIndex = (winnerIndex === 0 ? 1 : 0);
        const loserId = state.players[loserIndex].id;
        const [winnerProfile, loserProfile] = await Promise.all([
            this.prisma.profile.findUnique({ where: { userId: winnerId } }),
            this.prisma.profile.findUnique({ where: { userId: loserId } }),
        ]);
        const K = 32;
        const expectedScore = 1 / (1 + 10 ** ((loserProfile.mmr - winnerProfile.mmr) / 400));
        const mmrChange = Math.round(K * (1 - expectedScore));
        const baseXP = 50;
        const winBonus = 100;
        const turnBonus = Math.min(state.turn * 5, 100);
        const xpGained = baseXP + winBonus + turnBonus;
        const duration = Math.floor((Date.now() - startTime) / 1000);
        return {
            winner: winnerIndex,
            reason: 'health',
            duration,
            xpGained,
            mmrChange,
        };
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], GameService);
//# sourceMappingURL=game.service.js.map