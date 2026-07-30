"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRandomDeck = exports.getRandomCards = exports.getCardsByProfession = exports.ALL_CARDS = exports.TEST_CARDS = void 0;
exports.getTestDeck = getTestDeck;
exports.getCloudDeck = getCloudDeck;
exports.getAIDeck = getAIDeck;
exports.getSecurityDeck = getSecurityDeck;
const cardDatabase_1 = require("./cardDatabase");
Object.defineProperty(exports, "ALL_CARDS", { enumerable: true, get: function () { return cardDatabase_1.ALL_CARDS; } });
Object.defineProperty(exports, "getCardsByProfession", { enumerable: true, get: function () { return cardDatabase_1.getCardsByProfession; } });
Object.defineProperty(exports, "getRandomCards", { enumerable: true, get: function () { return cardDatabase_1.getRandomCards; } });
Object.defineProperty(exports, "buildRandomDeck", { enumerable: true, get: function () { return cardDatabase_1.buildRandomDeck; } });
exports.TEST_CARDS = cardDatabase_1.ALL_CARDS;
function getTestDeck() {
    return (0, cardDatabase_1.buildRandomDeck)();
}
function getCloudDeck() {
    const cloudCards = (0, cardDatabase_1.getCardsByProfession)('cloud');
    const neutralCards = (0, cardDatabase_1.getCardsByProfession)('neutral');
    const deck = [];
    for (let i = 0; i < 15 && i < cloudCards.length; i++) {
        deck.push({ ...cloudCards[i] });
        if (cloudCards[i].rarity !== 'legendary' && i + 15 < cloudCards.length) {
            deck.push({ ...cloudCards[i] });
        }
    }
    while (deck.length < 30 && neutralCards.length > 0) {
        const card = neutralCards[Math.floor(Math.random() * neutralCards.length)];
        const count = deck.filter(c => c.id === card.id).length;
        if (card.rarity === 'legendary' && count >= 1)
            continue;
        if (count >= 2)
            continue;
        deck.push({ ...card });
    }
    return deck.slice(0, 30);
}
function getAIDeck() {
    const aiCards = (0, cardDatabase_1.getCardsByProfession)('ai');
    const neutralCards = (0, cardDatabase_1.getCardsByProfession)('neutral');
    const deck = [];
    for (let i = 0; i < 15 && i < aiCards.length; i++) {
        deck.push({ ...aiCards[i] });
        if (aiCards[i].rarity !== 'legendary' && i + 15 < aiCards.length) {
            deck.push({ ...aiCards[i] });
        }
    }
    while (deck.length < 30 && neutralCards.length > 0) {
        const card = neutralCards[Math.floor(Math.random() * neutralCards.length)];
        const count = deck.filter(c => c.id === card.id).length;
        if (card.rarity === 'legendary' && count >= 1)
            continue;
        if (count >= 2)
            continue;
        deck.push({ ...card });
    }
    return deck.slice(0, 30);
}
function getSecurityDeck() {
    const securityCards = (0, cardDatabase_1.getCardsByProfession)('security');
    const neutralCards = (0, cardDatabase_1.getCardsByProfession)('neutral');
    const deck = [];
    for (let i = 0; i < 15 && i < securityCards.length; i++) {
        deck.push({ ...securityCards[i] });
        if (securityCards[i].rarity !== 'legendary' && i + 15 < securityCards.length) {
            deck.push({ ...securityCards[i] });
        }
    }
    while (deck.length < 30 && neutralCards.length > 0) {
        const card = neutralCards[Math.floor(Math.random() * neutralCards.length)];
        const count = deck.filter(c => c.id === card.id).length;
        if (card.rarity === 'legendary' && count >= 1)
            continue;
        if (count >= 2)
            continue;
        deck.push({ ...card });
    }
    return deck.slice(0, 30);
}
//# sourceMappingURL=test-cards.js.map