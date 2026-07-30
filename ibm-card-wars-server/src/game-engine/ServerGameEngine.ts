import { SeededRNG } from '../utils/SeededRNG';
import {
  GameState,
  PlayerState,
  Card,
  BoardCard,
  Lane,
  GameAction,
  ActionResult,
  GameEvent,
} from './types';
import { getCardById } from '../cards/cardDatabase';

/**
 * Server-side Game Engine
 * Authoritative game logic execution with deterministic RNG
 */
export class ServerGameEngine {
  private rng: SeededRNG;
  private instanceIdCounter = 0;

  constructor(seed: string) {
    this.rng = new SeededRNG(seed);
  }

  /**
   * Initialize a new game
   */
  initGame(
    player1Id: string,
    player1Name: string,
    deck1: Card[],
    player2Id: string,
    player2Name: string,
    deck2: Card[],
  ): GameState {
    // Create players
    const player1 = this.createInitialPlayer(player1Id, player1Name, deck1);
    const player2 = this.createInitialPlayer(player2Id, player2Name, deck2);

    // Shuffle decks
    this.rng.shuffle(player1.deck);
    this.rng.shuffle(player2.deck);

    // Draw opening hands (3 for player 1, 4 for player 2)
    for (let i = 0; i < 3; i++) {
      const card = player1.deck.pop();
      if (card) player1.hand.push(card);
    }
    for (let i = 0; i < 4; i++) {
      const card = player2.deck.pop();
      if (card) player2.hand.push(card);
    }

    // Initialize game state
    const state: GameState = {
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

    // Start first turn
    this.startTurn(state);

    return state;
  }

  /**
   * Execute a game action
   */
  executeAction(state: GameState, action: GameAction): ActionResult {
    // Validate action
    const validation = this.validateAction(state, action);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Execute based on type
    const events: GameEvent[] = [];

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

    // Add events to history
    state.history.push(...events);

    return {
      success: true,
      events,
    };
  }

  /**
   * Validate an action
   */
  private validateAction(
    state: GameState,
    action: GameAction,
  ): { valid: boolean; error?: string } {
    // Find player
    const playerIndex = state.players.findIndex((p) => p.id === action.playerId);
    if (playerIndex === -1) {
      return { valid: false, error: 'Player not found' };
    }

    const player = state.players[playerIndex];

    // Check if it's player's turn (except for concede)
    if (action.type !== 'concede' && state.currentPlayer !== playerIndex) {
      return { valid: false, error: 'Not your turn' };
    }

    // Validate specific actions
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

  /**
   * Validate play card action
   */
  private validatePlayCard(
    state: GameState,
    player: PlayerState,
    action: GameAction,
  ): { valid: boolean; error?: string } {
    // Check card in hand
    const card = player.hand.find((c) => c.id === action.cardId);
    if (!card) {
      return { valid: false, error: 'Card not in hand' };
    }

    // Check mana
    if (player.currentMana < card.cost) {
      return { valid: false, error: 'Not enough mana' };
    }

    // Check lane for employee cards
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

  /**
   * Validate attack action
   */
  private validateAttack(
    state: GameState,
    player: PlayerState,
    action: GameAction,
  ): { valid: boolean; error?: string } {
    // Find attacker
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

  /**
   * Execute play card
   */
  private executePlayCard(
    state: GameState,
    action: GameAction,
    events: GameEvent[],
  ): void {
    const player = state.players[state.currentPlayer];
    const cardIndex = player.hand.findIndex((c) => c.id === action.cardId);
    const card = player.hand[cardIndex];

    // Remove from hand
    player.hand.splice(cardIndex, 1);

    // Spend mana
    player.currentMana -= card.cost;

    // Execute based on card type
    if (card.type === 'employee') {
      this.playEmployeeCard(state, card, action.laneIndex!, events);
    } else {
      // Tool/Incident cards - execute effect immediately
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

  /**
   * Play employee card to board
   */
  private playEmployeeCard(
    state: GameState,
    card: Card,
    laneIndex: number,
    events: GameEvent[],
  ): void {
    const player = state.players[state.currentPlayer];
    const lane = state.lanes[laneIndex];

    // Create board card instance
    const boardCard: BoardCard = {
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

    // Add to lane
    lane.cards[state.currentPlayer] = boardCard;

    // Add to player board
    player.board.push(boardCard);

    // Execute battlecry
    if (card.battlecry) {
      this.executeEffect(state, card.battlecry, boardCard, events);
    }
  }

  /**
   * Execute card effect
   */
  private executeCardEffect(
    state: GameState,
    card: Card,
    events: GameEvent[],
  ): void {
    if (card.battlecry) {
      this.executeEffect(state, card.battlecry, null, events);
    }
  }

  /**
   * Execute an effect
   */
  private executeEffect(
    state: GameState,
    effect: any,
    source: BoardCard | null,
    events: GameEvent[],
  ): void {
    // Simplified effect execution - expand based on effect type
    switch (effect.type) {
      case 'damage':
        // Handle damage effects
        break;
      case 'heal':
        // Handle heal effects
        break;
      case 'draw':
        // Handle draw effects
        const player = state.players[state.currentPlayer];
        for (let i = 0; i < (effect.amount || 1); i++) {
          this.drawCard(player, events);
        }
        break;
      // Add more effect types as needed
    }
  }

  /**
   * Execute end turn
   */
  private executeEndTurn(state: GameState, events: GameEvent[]): void {
    // Resolve combat
    this.resolveCombat(state, events);

    // Check for game over
    this.checkGameOver(state);

    if (state.gameOver) return;

    // Switch players
    state.currentPlayer = state.currentPlayer === 0 ? 1 : 0;

    // Increment turn if back to player 0
    if (state.currentPlayer === 0) {
      state.turn++;
    }

    // Start new turn
    this.startTurn(state);

    events.push({
      type: 'turn_end',
      timestamp: Date.now(),
    });
  }

  /**
   * Start a new turn
   */
  private startTurn(state: GameState): void {
    const player = state.players[state.currentPlayer];

    // Draw card
    this.drawCard(player, state.history);

    // Gain mana crystal
    if (player.maxMana < 10) {
      player.maxMana++;
    }

    // Refill mana
    player.currentMana = player.maxMana;

    // Reset board cards
    for (const card of player.board) {
      card.summoningSickness = false;
      card.hasAttacked = false;
    }

    // Reset stats
    player.cardsPlayedThisTurn = 0;
    player.damageDealtThisTurn = 0;
  }

  /**
   * Draw a card
   */
  private drawCard(player: PlayerState, events: GameEvent[]): void {
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

  /**
   * Resolve combat phase
   */
  private resolveCombat(state: GameState, events: GameEvent[]): void {
    for (const lane of state.lanes) {
      const [card0, card1] = lane.cards;

      if (card0 && card1) {
        // Both cards attack each other
        this.dealDamage(state, card0, card1, card0.currentAttack, events);
        this.dealDamage(state, card1, card0, card1.currentAttack, events);
      } else if (card0) {
        // Card 0 attacks player 1
        this.damagePlayer(state, 1, card0.currentAttack, events);
      } else if (card1) {
        // Card 1 attacks player 0
        this.damagePlayer(state, 0, card1.currentAttack, events);
      }
    }

    // Remove dead cards
    this.removeDeadCards(state, events);
  }

  /**
   * Deal damage to a card
   */
  private dealDamage(
    state: GameState,
    source: BoardCard,
    target: BoardCard,
    amount: number,
    events: GameEvent[],
  ): void {
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

    // Lifesteal
    if (source.keywords.includes('lifesteal')) {
      const player = state.players[source.playerIndex];
      player.health = Math.min(player.maxHealth, player.health + amount);
    }

    // Poison
    if (source.keywords.includes('poison')) {
      target.currentHealth = 0;
    }
  }

  /**
   * Damage player
   */
  private damagePlayer(
    state: GameState,
    playerIndex: number,
    amount: number,
    events: GameEvent[],
  ): void {
    const player = state.players[playerIndex];
    player.health -= amount;

    events.push({
      type: 'player_damaged',
      timestamp: Date.now(),
      playerId: player.id,
      amount,
    });
  }

  /**
   * Remove dead cards from board
   */
  private removeDeadCards(state: GameState, events: GameEvent[]): void {
    for (const lane of state.lanes) {
      for (let i = 0; i < 2; i++) {
        const card = lane.cards[i];
        if (card && card.currentHealth <= 0) {
          // Remove from lane
          lane.cards[i] = null;

          // Remove from player board
          const player = state.players[card.playerIndex];
          const boardIndex = player.board.findIndex(
            (c) => c.instanceId === card.instanceId,
          );
          if (boardIndex !== -1) {
            player.board.splice(boardIndex, 1);
          }

          // Add to graveyard
          player.graveyard.push(card);

          // Execute deathrattle
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

  /**
   * Execute attack action
   */
  private executeAttack(
    state: GameState,
    action: GameAction,
    events: GameEvent[],
  ): void {
    const player = state.players[state.currentPlayer];
    const attacker = player.board.find((c) => c.instanceId === action.cardId);

    if (!attacker) return;

    attacker.hasAttacked = true;

    // Find target in same lane
    const lane = state.lanes[attacker.laneIndex];
    const opponentIndex = state.currentPlayer === 0 ? 1 : 0;
    const target = lane.cards[opponentIndex];

    if (target) {
      this.dealDamage(state, attacker, target, attacker.currentAttack, events);
    } else {
      this.damagePlayer(state, opponentIndex, attacker.currentAttack, events);
    }

    this.removeDeadCards(state, events);
    this.checkGameOver(state);
  }

  /**
   * Execute concede
   */
  private executeConcede(
    state: GameState,
    action: GameAction,
    events: GameEvent[],
  ): void {
    const playerIndex = state.players.findIndex((p) => p.id === action.playerId);
    state.winner = playerIndex === 0 ? 1 : 0;
    state.gameOver = true;

    events.push({
      type: 'game_over',
      timestamp: Date.now(),
      playerId: action.playerId,
    });
  }

  /**
   * Check for game over conditions
   */
  private checkGameOver(state: GameState): void {
    for (let i = 0; i < 2; i++) {
      if (state.players[i].health <= 0) {
        state.gameOver = true;
        state.winner = i === 0 ? 1 : 0;
        break;
      }
    }
  }

  /**
   * Create initial player state
   */
  private createInitialPlayer(
    id: string,
    name: string,
    deck: Card[],
  ): PlayerState {
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
