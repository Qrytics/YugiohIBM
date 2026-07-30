import type { Card } from '../game-engine/types';
export declare const ALL_CARDS: Card[];
export declare function getCardById(id: string): Card | undefined;
export declare function getCardsByProfession(profession: string): Card[];
export declare function getCardsByRarity(rarity: string): Card[];
export declare function getCardsByType(type: string): Card[];
export declare function getCardsByCost(cost: number): Card[];
export declare function getRandomCard(): Card;
export declare function getRandomCards(count: number): Card[];
export declare function buildRandomDeck(): Card[];
export declare function getCardStats(): {
    total: number;
    byType: {
        employee: number;
        tool: number;
        incident: number;
        executive: number;
        upgrade: number;
    };
    byRarity: {
        common: number;
        rare: number;
        epic: number;
        legendary: number;
        mythic: number;
    };
    byProfession: {
        neutral: number;
        cloud: number;
        ai: number;
        security: number;
        data: number;
        software: number;
        devops: number;
        ux: number;
        pm: number;
        business: number;
        sales: number;
        mainframe: number;
        sre: number;
    };
};
