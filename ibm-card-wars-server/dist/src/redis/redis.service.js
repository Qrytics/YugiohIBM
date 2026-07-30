"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
let RedisService = class RedisService {
    client;
    async onModuleInit() {
        this.client = (0, redis_1.createClient)({
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
    async setGameState(matchId, state) {
        const key = `game:${matchId}`;
        await this.client.setEx(key, 300, JSON.stringify(state));
    }
    async getGameState(matchId) {
        const key = `game:${matchId}`;
        const data = await this.client.get(key);
        if (!data) {
            return null;
        }
        try {
            return JSON.parse(data);
        }
        catch (error) {
            console.error(`Failed to parse game state for match ${matchId}:`, error);
            return null;
        }
    }
    async deleteGameState(matchId) {
        const key = `game:${matchId}`;
        await this.client.del(key);
    }
    async gameStateExists(matchId) {
        const key = `game:${matchId}`;
        const exists = await this.client.exists(key);
        return exists === 1;
    }
    async extendGameStateTTL(matchId) {
        const key = `game:${matchId}`;
        await this.client.expire(key, 300);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map