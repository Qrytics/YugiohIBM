/**
 * Turn System - Manages turn flow and phases
 *
 * Turn Phases:
 * 1. Mulligan (first turn only) - Replace cards from opening hand
 * 2. Draw - Draw a card from deck
 * 3. Main - Play cards and use abilities
 * 4. Combat - Auto-battler resolves all lane battles
 * 5. End - End-of-turn effects, switch player
 */

import type { GameState, PlayerState, GameEvent } from '../types';
import { ManaSystem } from './ManaSystem';
import { CombatResolver } from '../combat/CombatResolver';

export class TurnSystem {
  /**
   * Start a new turn for the current player
   */
  static startTurn(state: GameState): GameEvent[] {
    const events: GameEvent[] = [];
    const player = state.players[state.currentPlayer];

    // Increment turn counter (every full round)
    if (state.currentPlayer === 0) {
      state.turn++;
    }

    // Calculate turn number for this player (for mana)
    const playerTurnNumber = Math.ceil(state.turn / 2);

    // Phase 1: Draw
    state.phase = 'draw';
    this.drawCard(player);
    events.push({
      type: 'card_drawn',
      timestamp: Date.now(),
      playerId: player.id,
    });

    // Phase 2: Refill mana and gain mana crystal
    ManaSystem.startTurn(player, playerTurnNumber);
    events.push({
      type: 'mana_gained',
      timestamp: Date.now(),
      playerId: player.id,
      amount: player.maxMana,
    });

    // Reset attack state for all units
    CombatResolver.resetAttackState(state);

    // Phase 3: Start-of-turn triggers
    this.triggerStartOfTurnEffects(state, player);

    // Phase 4: Main phase (player can now play cards)
    state.phase = 'main';

    events.push({
      type: 'turn_start',
      timestamp: Date.now(),
      playerId: player.id,
    });

    // Reset turn counters
    player.cardsPlayedThisTurn = 0;
    player.damageDealtThisTurn = 0;

    return events;
  }

  /**
   * End the current player's turn
   */
  static endTurn(state: GameState): GameEvent[] {
    const events: GameEvent[] = [];
    const player = state.players[state.currentPlayer];

    // Phase 1: Combat
    state.phase = 'combat';
    const combatEvents = CombatResolver.resolveCombatPhase(state);
    events.push(...combatEvents);

    // Phase 2: End of turn triggers
    state.phase = 'end';
    this.triggerEndOfTurnEffects(state, player);

    events.push({
      type: 'turn_end',
      timestamp: Date.now(),
      playerId: player.id,
    });

    // Check for game over
    if (state.gameOver) {
      events.push({
        type: 'game_over',
        timestamp: Date.now(),
        data: { winnerId: state.winner },
      });
      return events;
    }

    // Phase 3: Switch player
    state.currentPlayer = state.currentPlayer === 0 ? 1 : 0;

    // Start next player's turn
    const nextTurnEvents = this.startTurn(state);
    events.push(...nextTurnEvents);

    return events;
  }

  /**
   * Draw a card from deck to hand
   */
  static drawCard(player: PlayerState): boolean {
    // Check for fatigue (no cards left)
    if (player.deck.length === 0) {
      // Fatigue damage (starts at 1, increases each time)
      player.fatigueCount = (player.fatigueCount || 0) + 1;
      const fatigueDamage = player.fatigueCount;
      player.health = Math.max(0, player.health - fatigueDamage);
      return false;
    }

    // Check for hand full (max 10 cards)
    if (player.hand.length >= 10) {
      // Card is burned (destroyed)
      player.deck.pop();
      return false;
    }

    // Draw card
    const card = player.deck.pop();
    if (card) {
      player.hand.push(card);
      return true;
    }

    return false;
  }

  /**
   * Trigger start-of-turn effects for all cards on board
   */
  private static triggerStartOfTurnEffects(state: GameState, player: PlayerState): void {
    // Iterate through all cards on board
    for (const card of player.board) {
      if (card.trigger && card.trigger.on === 'start_of_turn' && !card.isSilenced) {
        console.log(`Triggering start-of-turn effect for ${card.name}`);
        // EffectsEngine would be called here with: EffectsEngine.resolve(state, card.trigger.effect, card);
      }
    }

    // Clear frozen status
    for (const card of player.board) {
      if (card.isFrozen) {
        card.isFrozen = false;
      }
    }
  }

  /**
   * Trigger end-of-turn effects for all cards on board
   */
  private static triggerEndOfTurnEffects(state: GameState, player: PlayerState): void {
    // Iterate through all cards on board
    for (const card of player.board) {
      if (card.trigger && card.trigger.on === 'end_of_turn' && !card.isSilenced) {
        console.log(`Triggering end-of-turn effect for ${card.name}`);
        // EffectsEngine would be called here with: EffectsEngine.resolve(state, card.trigger.effect, card);
      }

      // Decrement buff durations
      card.buffs = card.buffs.filter((buff) => {
        if (buff.duration !== undefined) {
          buff.duration--;
          return buff.duration > 0;
        }
        return true; // Permanent buffs stay
      });

      // Decrement status effect durations
      card.statusEffects = card.statusEffects.filter((effect) => {
        if (effect.duration !== undefined) {
          effect.duration--;
          return effect.duration > 0;
        }
        return true; // Permanent effects stay
      });
    }
  }

  /**
   * Mulligan phase - replace cards from opening hand
   */
  static mulligan(state: GameState, player: PlayerState, cardIds: string[]): void {
    // Remove selected cards from hand
    const replacedCards = player.hand.filter((card) => cardIds.includes(card.id));
    player.hand = player.hand.filter((card) => !cardIds.includes(card.id));

    // Put replaced cards back into deck
    player.deck.push(...replacedCards);

    // Shuffle deck
    this.shuffleDeck(player);

    // Draw same number of cards
    for (let i = 0; i < replacedCards.length; i++) {
      this.drawCard(player);
    }
  }

  /**
   * Shuffle player's deck
   */
  private static shuffleDeck(player: PlayerState): void {
    for (let i = player.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [player.deck[i], player.deck[j]] = [player.deck[j], player.deck[i]];
    }
  }

  /**
   * Check if game is over and determine winner
   */
  static checkGameOver(state: GameState): void {
    // Player 0 dead
    if (state.players[0].health <= 0) {
      state.winner = 1;
      state.gameOver = true;
    }

    // Player 1 dead
    if (state.players[1].health <= 0) {
      state.winner = 0;
      state.gameOver = true;
    }

    // Both players dead (draw)
    if (state.players[0].health <= 0 && state.players[1].health <= 0) {
      state.winner = null; // Draw
      state.gameOver = true;
    }
  }
}
