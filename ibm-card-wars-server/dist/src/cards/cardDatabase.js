"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_CARDS = void 0;
exports.getCardById = getCardById;
exports.getCardsByProfession = getCardsByProfession;
exports.getCardsByRarity = getCardsByRarity;
exports.getCardsByType = getCardsByType;
exports.getCardsByCost = getCardsByCost;
exports.getRandomCard = getRandomCard;
exports.getRandomCards = getRandomCards;
exports.buildRandomDeck = buildRandomDeck;
exports.getCardStats = getCardStats;
const neutral_1 = require("./data/neutral");
const cloud_1 = require("./data/cloud");
const ai_1 = require("./data/ai");
const security_1 = require("./data/security");
const data_1 = require("./data/data");
const software_1 = require("./data/software");
const devops_1 = require("./data/devops");
const ux_1 = require("./data/ux");
const pm_1 = require("./data/pm");
const business_1 = require("./data/business");
const sales_1 = require("./data/sales");
const mainframe_1 = require("./data/mainframe");
const sre_1 = require("./data/sre");
exports.ALL_CARDS = [
    ...neutral_1.neutralCards,
    ...cloud_1.cloudCards,
    ...ai_1.aiCards,
    ...security_1.securityCards,
    ...data_1.dataCards,
    ...software_1.softwareCards,
    ...devops_1.devopsCards,
    ...ux_1.uxCards,
    ...pm_1.pmCards,
    ...business_1.businessCards,
    ...sales_1.salesCards,
    ...mainframe_1.mainframeCards,
    ...sre_1.sreCards,
];
function getCardById(id) {
    return exports.ALL_CARDS.find((card) => card.id === id);
}
function getCardsByProfession(profession) {
    return exports.ALL_CARDS.filter((card) => card.profession === profession);
}
function getCardsByRarity(rarity) {
    return exports.ALL_CARDS.filter((card) => card.rarity === rarity);
}
function getCardsByType(type) {
    return exports.ALL_CARDS.filter((card) => card.type === type);
}
function getCardsByCost(cost) {
    return exports.ALL_CARDS.filter((card) => card.cost === cost);
}
function getRandomCard() {
    return exports.ALL_CARDS[Math.floor(Math.random() * exports.ALL_CARDS.length)];
}
function getRandomCards(count) {
    const cards = [];
    for (let i = 0; i < count; i++) {
        const roll = Math.random() * 100;
        let rarity;
        if (roll < 70)
            rarity = 'common';
        else if (roll < 90)
            rarity = 'rare';
        else if (roll < 98)
            rarity = 'epic';
        else if (roll < 99.9)
            rarity = 'legendary';
        else
            rarity = 'mythic';
        const pool = getCardsByRarity(rarity);
        if (pool.length > 0) {
            cards.push(pool[Math.floor(Math.random() * pool.length)]);
        }
    }
    return cards;
}
function buildRandomDeck() {
    const deck = [];
    const professions = ['neutral', 'cloud', 'ai', 'security', 'data', 'software', 'devops', 'ux', 'pm', 'business', 'sales', 'mainframe', 'sre'];
    const mainProfession = professions[Math.floor(Math.random() * professions.length)];
    const professionPool = mainProfession === 'neutral'
        ? neutral_1.neutralCards
        : [...getCardsByProfession(mainProfession), ...neutral_1.neutralCards.filter(c => c.type === 'employee')];
    while (deck.length < 30 && professionPool.length > 0) {
        const card = professionPool[Math.floor(Math.random() * professionPool.length)];
        const count = deck.filter(c => c.id === card.id).length;
        if (card.rarity === 'legendary' && count >= 1)
            continue;
        if (count >= 2)
            continue;
        deck.push({ ...card });
    }
    return deck;
}
function getCardStats() {
    return {
        total: exports.ALL_CARDS.length,
        byType: {
            employee: getCardsByType('employee').length,
            tool: getCardsByType('tool').length,
            incident: getCardsByType('incident').length,
            executive: getCardsByType('executive').length,
            upgrade: getCardsByType('upgrade').length,
        },
        byRarity: {
            common: getCardsByRarity('common').length,
            rare: getCardsByRarity('rare').length,
            epic: getCardsByRarity('epic').length,
            legendary: getCardsByRarity('legendary').length,
            mythic: getCardsByRarity('mythic').length,
        },
        byProfession: {
            neutral: getCardsByProfession('neutral').length,
            cloud: getCardsByProfession('cloud').length,
            ai: getCardsByProfession('ai').length,
            security: getCardsByProfession('security').length,
            data: getCardsByProfession('data').length,
            software: getCardsByProfession('software').length,
            devops: getCardsByProfession('devops').length,
            ux: getCardsByProfession('ux').length,
            pm: getCardsByProfession('pm').length,
            business: getCardsByProfession('business').length,
            sales: getCardsByProfession('sales').length,
            mainframe: getCardsByProfession('mainframe').length,
            sre: getCardsByProfession('sre').length,
        },
    };
}
//# sourceMappingURL=cardDatabase.js.map