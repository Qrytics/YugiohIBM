"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchmakingService = void 0;
const common_1 = require("@nestjs/common");
let MatchmakingService = class MatchmakingService {
    queue = new Map();
    joinQueue(entry) {
        this.queue.set(entry.userId, entry);
        console.log(`Player ${entry.userId} joined queue (MMR: ${entry.mmr})`);
    }
    leaveQueue(userId) {
        const entry = this.queue.get(userId);
        if (entry) {
            this.queue.delete(userId);
            console.log(`Player ${userId} left queue`);
        }
    }
    findMatch(userId) {
        const user = this.queue.get(userId);
        if (!user)
            return null;
        const timeSinceJoin = Date.now() - user.joinedAt;
        const initialRange = 50;
        const maxRange = 200;
        const range = Math.min(initialRange + (timeSinceJoin / 1000) * 10, maxRange);
        let bestOpponent = null;
        let smallestDiff = Infinity;
        for (const [opponentId, opponent] of this.queue) {
            if (opponentId === userId)
                continue;
            const mmrDiff = Math.abs(opponent.mmr - user.mmr);
            if (mmrDiff <= range && mmrDiff < smallestDiff) {
                bestOpponent = opponent;
                smallestDiff = mmrDiff;
            }
        }
        if (!bestOpponent) {
            return null;
        }
        this.queue.delete(userId);
        this.queue.delete(bestOpponent.userId);
        console.log(`Match found: ${user.userId} (${user.mmr}) vs ${bestOpponent.userId} (${bestOpponent.mmr}) [diff: ${smallestDiff}]`);
        return {
            player1: user,
            player2: bestOpponent,
        };
    }
    getQueueSize() {
        return this.queue.size;
    }
    getEntry(userId) {
        return this.queue.get(userId);
    }
    isInQueue(userId) {
        return this.queue.has(userId);
    }
    clearQueue() {
        this.queue.clear();
        console.log('Matchmaking queue cleared');
    }
};
exports.MatchmakingService = MatchmakingService;
exports.MatchmakingService = MatchmakingService = __decorate([
    (0, common_1.Injectable)()
], MatchmakingService);
//# sourceMappingURL=matchmaking.service.js.map