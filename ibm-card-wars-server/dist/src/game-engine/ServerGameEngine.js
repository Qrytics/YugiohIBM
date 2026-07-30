"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerGameEngine = void 0;
const SeededRNG_1 = require("../utils/SeededRNG");
class ServerGameEngine {
    rng;
    instanceIdCounter = 0;
    constructor(seed) {
        this.rng = new SeededRNG_1.SeededRNG(seed);
    }
    initGame(player1Id, player1Name, deck1, player2Id, player2Name, deck2) {
        const player1 = this.createInitialPlayer(player1Id, player1Name, deck1);
        const player2 = this.createInitialPlayer(player2Id, player2Name, deck2);
        this.rng.shuffle(player1.deck);
        this.rng.shuffle(player2.deck);
        for (let i = 0; i < 3; i++) {
            const card = player1.deck.pop();
            if (card)
                player1.hand.push(card);
        }
        for (let i = 0; i < 4; i++) {
            const card = player2.deck.pop();
            if (card)
                player2.hand.push(card);
        }
        const state = {
            players: [player1, player2],
            currentPlayer: 0,
            turn: 1,
            phase: 'main',
            lanes: [
                { index: 0, cards: [null, null] },
                { index: 1, cards: [null, null] },
                { index: 2, cards: [null, null] },
                { index: 3, cards: [null, null] },
            ],
            winner: null,
            gameOver: false,
            history: [],
        };
        this.startTurn(state);
        return state;
    }
    executeAction(state, action) {
        const validation = this.validateAction(state, action);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error,
            };
        }
        const events = [];
        switch (action.type) {
            case 'play_card':
                this.executePlayCard(state, action, events);
                break;
            case 'end_turn':
                this.executeEndTurn(state, events);
                break;
            case 'attack':
                this.executeAttack(state, action, events);
                break;
            case 'concede':
                this.executeConcede(state, action, events);
                break;
            default:
                return {
                    success: false,
                    error: `Unknown action type: ${action.type}`,
                };
        }
        state.history.push(...events);
        return {
            success: true,
            events,
        };
    }
    validateAction(state, action) {
        const playerIndex = state.players.findIndex((p) => p.id === action.playerId);
        if (playerIndex === -1) {
            return { valid: false, error: 'Player not found' };
        }
        const player = state.players[playerIndex];
        if (action.type !== 'concede' && state.currentPlayer !== playerIndex) {
            return { valid: false, error: 'Not your turn' };
        }
        switch (action.type) {
            case 'play_card':
                return this.validatePlayCard(state, player, action);
            case 'attack':
                return this.validateAttack(state, player, action);
            case 'end_turn':
            case 'concede':
                return { valid: true };
            default:
                return { valid: false, error: 'Unknown action type' };
        }
    }
    validatePlayCard(state, player, action) {
        const card = player.hand.find((c) => c.id === action.cardId);
        if (!card) {
            return { valid: false, error: 'Card not in hand' };
        }
        if (player.currentMana < card.cost) {
            return { valid: false, error: 'Not enough mana' };
        }
        if (card.type === 'employee') {
            if (action.laneIndex === undefined) {
                return { valid: false, error: 'Lane index required for employee cards' };
            }
            if (action.laneIndex < 0 || action.laneIndex > 3) {
                return { valid: false, error: 'Invalid lane index' };
            }
            const lane = state.lanes[action.laneIndex];
            const playerSlot = state.currentPlayer;
            if (lane.cards[playerSlot] !== null) {
                return { valid: false, error: 'Lane is occupied' };
            }
        }
        return { valid: true };
    }
    validateAttack(state, player, action) {
        const attacker = player.board.find((c) => c.instanceId === action.cardId);
        if (!attacker) {
            return { valid: false, error: 'Card not on board' };
        }
        if (attacker.summoningSickness) {
            return { valid: false, error: 'Card has summoning sickness' };
        }
        if (attacker.hasAttacked) {
            return { valid: false, error: 'Card already attacked this turn' };
        }
        return { valid: true };
    }
    executePlayCard(state, action, events) {
        const player = state.players[state.currentPlayer];
        const cardIndex = player.hand.findIndex((c) => c.id === action.cardId);
        const card = player.hand[cardIndex];
        player.hand.splice(cardIndex, 1);
        player.currentMana -= card.cost;
        if (card.type === 'employee') {
            this.playEmployeeCard(state, card, action.laneIndex, events);
        }
        else {
            this.executeCardEffect(state, card, events);
            player.graveyard.push(card);
        }
        player.cardsPlayedThisTurn++;
        events.push({
            type: 'card_played',
            timestamp: Date.now(),
            playerId: player.id,
            cardId: card.id,
        });
    }
    playEmployeeCard(state, card, laneIndex, events) {
        const player = state.players[state.currentPlayer];
        const lane = state.lanes[laneIndex];
        const boardCard = {
            ...card,
            instanceId: `card_${this.instanceIdCounter++}`,
            currentHealth: card.health || 0,
            currentAttack: card.attack || 0,
            statusEffects: [],
            summoningSickness: !card.keywords.includes('rush'),
            hasAttacked: false,
            hasTaunt: card.keywords.includes('taunt'),
            hasStealth: card.keywords.includes('stealth'),
            hasDivineShield: card.keywords.includes('divine_shield'),
            isImmune: card.keywords.includes('immune'),
            isFrozen: false,
            isSilenced: false,
            buffs: [],
            laneIndex,
            playerIndex: state.currentPlayer,
        };
        lane.cards[state.currentPlayer] = boardCard;
        player.board.push(boardCard);
        if (card.battlecry) {
            this.executeEffect(state, card.battlecry, boardCard, events);
        }
    }
    executeCardEffect(state, card, events) {
        if (card.battlecry) {
            this.executeEffect(state, card.battlecry, null, events);
        }
    }
    executeEffect(state, effect, source, events) {
        switch (effect.type) {
            case 'damage':
                break;
            case 'heal':
                break;
            case 'draw':
                const player = state.players[state.currentPlayer];
                for (let i = 0; i < (effect.amount || 1); i++) {
                    this.drawCard(player, events);
                }
                break;
        }
    }
    executeEndTurn(state, events) {
        this.resolveCombat(state, events);
        this.checkGameOver(state);
        if (state.gameOver)
            return;
        state.currentPlayer = state.currentPlayer === 0 ? 1 : 0;
        if (state.currentPlayer === 0) {
            state.turn++;
        }
        this.startTurn(state);
        events.push({
            type: 'turn_end',
            timestamp: Date.now(),
        });
    }
    startTurn(state) {
        const player = state.players[state.currentPlayer];
        this.drawCard(player, state.history);
        if (player.maxMana < 10) {
            player.maxMana++;
        }
        player.currentMana = player.maxMana;
        for (const card of player.board) {
            card.summoningSickness = false;
            card.hasAttacked = false;
        }
        player.cardsPlayedThisTurn = 0;
        player.damageDealtThisTurn = 0;
    }
    drawCard(player, events) {
        const card = player.deck.pop();
        if (card) {
            player.hand.push(card);
            events.push({
                type: 'card_drawn',
                timestamp: Date.now(),
                playerId: player.id,
                cardId: card.id,
            });
        }
    }
    resolveCombat(state, events) {
        for (const lane of state.lanes) {
            const [card0, card1] = lane.cards;
            if (card0 && card1) {
                this.dealDamage(state, card0, card1, card0.currentAttack, events);
                this.dealDamage(state, card1, card0, card1.currentAttack, events);
            }
            else if (card0) {
                this.damagePlayer(state, 1, card0.currentAttack, events);
            }
            else if (card1) {
                this.damagePlayer(state, 0, card1.currentAttack, events);
            }
        }
        this.removeDeadCards(state, events);
    }
    dealDamage(state, source, target, amount, events) {
        if (target.hasDivineShield) {
            target.hasDivineShield = false;
            return;
        }
        target.currentHealth -= amount;
        events.push({
            type: 'card_damaged',
            timestamp: Date.now(),
            cardId: target.instanceId,
            amount,
        });
        if (source.keywords.includes('lifesteal')) {
            const player = state.players[source.playerIndex];
            player.health = Math.min(player.maxHealth, player.health + amount);
        }
        if (source.keywords.includes('poison')) {
            target.currentHealth = 0;
        }
    }
    damagePlayer(state, playerIndex, amount, events) {
        const player = state.players[playerIndex];
        player.health -= amount;
        events.push({
            type: 'player_damaged',
            timestamp: Date.now(),
            playerId: player.id,
            amount,
        });
    }
    removeDeadCards(state, events) {
        for (const lane of state.lanes) {
            for (let i = 0; i < 2; i++) {
                const card = lane.cards[i];
                if (card && card.currentHealth <= 0) {
                    lane.cards[i] = null;
                    const player = state.players[card.playerIndex];
                    const boardIndex = player.board.findIndex((c) => c.instanceId === card.instanceId);
                    if (boardIndex !== -1) {
                        player.board.splice(boardIndex, 1);
                    }
                    player.graveyard.push(card);
                    if (card.deathrattle) {
                        this.executeEffect(state, card.deathrattle, card, events);
                    }
                    events.push({
                        type: 'card_died',
                        timestamp: Date.now(),
                        cardId: card.instanceId,
                        playerId: player.id,
                    });
                }
            }
        }
    }
    executeAttack(state, action, events) {
        const player = state.players[state.currentPlayer];
        const attacker = player.board.find((c) => c.instanceId === action.cardId);
        if (!attacker)
            return;
        attacker.hasAttacked = true;
        const lane = state.lanes[attacker.laneIndex];
        const opponentIndex = state.currentPlayer === 0 ? 1 : 0;
        const target = lane.cards[opponentIndex];
        if (target) {
            this.dealDamage(state, attacker, target, attacker.currentAttack, events);
        }
        else {
            this.damagePlayer(state, opponentIndex, attacker.currentAttack, events);
        }
        this.removeDeadCards(state, events);
        this.checkGameOver(state);
    }
    executeConcede(state, action, events) {
        const playerIndex = state.players.findIndex((p) => p.id === action.playerId);
        state.winner = playerIndex === 0 ? 1 : 0;
        state.gameOver = true;
        events.push({
            type: 'game_over',
            timestamp: Date.now(),
            playerId: action.playerId,
        });
    }
    checkGameOver(state) {
        for (let i = 0; i < 2; i++) {
            if (state.players[i].health <= 0) {
                state.gameOver = true;
                state.winner = i === 0 ? 1 : 0;
                break;
            }
        }
    }
    createInitialPlayer(id, name, deck) {
        return {
            id,
            name,
            avatar: 'default',
            health: 30,
            maxHealth: 30,
            maxMana: 0,
            currentMana: 0,
            deck: [...deck],
            hand: [],
            board: [],
            graveyard: [],
            cardsPlayedThisTurn: 0,
            damageDealtThisTurn: 0,
        };
    }
}
exports.ServerGameEngine = ServerGameEngine;
//# sourceMappingURL=ServerGameEngine.js.map