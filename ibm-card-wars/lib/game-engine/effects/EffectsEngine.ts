/**
 * Effects Engine - Resolves card abilities and effects
 *
 * Handles all effect types: damage, heal, draw, summon, buff, etc.
 */

import type { GameState, Effect, BoardCard, PlayerState } from '../types';

export class EffectsEngine {
  /**
   * Resolve an effect
   */
  static resolve(state: GameState, effect: Effect, source?: BoardCard): void {
    switch (effect.type) {
      case 'damage':
        this.resolveDamage(state, effect, source);
        break;
      case 'heal':
        this.resolveHeal(state, effect, source);
        break;
      case 'draw':
        this.resolveDraw(state, effect, source);
        break;
      case 'buff':
        this.resolveBuff(state, effect, source);
        break;
      case 'destroy':
        this.resolveDestroy(state, effect, source);
        break;
      // TODO: Implement more effect types
      default:
        console.warn(`Unimplemented effect type: ${effect.type}`);
    }
  }

  /**
   * Deal damage to target(s)
   */
  private static resolveDamage(
    state: GameState,
    effect: Effect,
    source?: BoardCard
  ): void {
    const targets = this.findTargets(state, effect, source);
    const amount = effect.amount || 0;

    for (const target of targets) {
      if ('currentHealth' in target) {
        // Target is a BoardCard
        const card = target as BoardCard;
        card.currentHealth -= amount;

        if (card.currentHealth <= 0) {
          // Card dies
          this.destroyCard(state, card);
        }
      } else {
        // Target is a PlayerState
        const player = target as PlayerState;
        player.health = Math.max(0, player.health - amount);
      }
    }
  }

  /**
   * Heal target(s)
   */
  private static resolveHeal(
    state: GameState,
    effect: Effect,
    source?: BoardCard
  ): void {
    const targets = this.findTargets(state, effect, source);
    const amount = effect.amount || 0;

    for (const target of targets) {
      if ('currentHealth' in target) {
        // Target is a BoardCard
        const card = target as BoardCard;
        const maxHealth = card.health || 0;
        card.currentHealth = Math.min(maxHealth, card.currentHealth + amount);
      } else {
        // Target is a PlayerState
        const player = target as PlayerState;
        player.health = Math.min(player.maxHealth, player.health + amount);
      }
    }
  }

  /**
   * Draw card(s)
   */
  private static resolveDraw(
    state: GameState,
    effect: Effect,
    source?: BoardCard
  ): void {
    const amount = effect.amount || 1;
    const playerIndex = source?.playerIndex ?? state.currentPlayer;
    const player = state.players[playerIndex];

    for (let i = 0; i < amount; i++) {
      if (player.deck.length === 0) break; // Fatigue
      if (player.hand.length >= 10) break; // Hand full

      const card = player.deck.pop();
      if (card) {
        player.hand.push(card);
      }
    }
  }

  /**
   * Apply buff to target(s)
   */
  private static resolveBuff(
    state: GameState,
    effect: Effect,
    source?: BoardCard
  ): void {
    const targets = this.findTargets(state, effect, source);
    const amount = effect.amount || 0;

    for (const target of targets) {
      if ('currentHealth' in target) {
        const card = target as BoardCard;

        // Add buff
        card.buffs.push({
          attack: amount,
          health: amount,
          source: source?.instanceId || 'effect',
          duration: undefined, // Permanent
        });

        // Apply buff immediately
        card.currentAttack += amount;
        card.currentHealth += amount;
      }
    }
  }

  /**
   * Destroy target(s)
   */
  private static resolveDestroy(
    state: GameState,
    effect: Effect,
    source?: BoardCard
  ): void {
    const targets = this.findTargets(state, effect, source);

    for (const target of targets) {
      if ('currentHealth' in target) {
        const card = target as BoardCard;
        this.destroyCard(state, card);
      }
    }
  }

  /**
   * Find targets for an effect based on TargetSelector
   */
  private static findTargets(
    state: GameState,
    effect: Effect,
    source?: BoardCard
  ): (BoardCard | PlayerState)[] {
    if (!effect.target) return [];

    const targets: (BoardCard | PlayerState)[] = [];
    const sourcePlayerIndex = source?.playerIndex ?? state.currentPlayer;

    // Handle string targets from Phase 2 cards - return empty array for now
    if (typeof effect.target === 'string') {
      console.log(`[Phase 2] String target not yet implemented: ${effect.target}`);
      return [];
    }

    switch (effect.target.type) {
      case 'all_friendly': {
        const player = state.players[sourcePlayerIndex];
        targets.push(...player.board);
        break;
      }

      case 'all_enemy': {
        const opponentIndex = sourcePlayerIndex === 0 ? 1 : 0;
        const opponent = state.players[opponentIndex];
        targets.push(...opponent.board);
        break;
      }

      case 'all_units': {
        for (const player of state.players) {
          targets.push(...player.board);
        }
        break;
      }

      case 'random_friendly': {
        const player = state.players[sourcePlayerIndex];
        if (player.board.length > 0) {
          const randomIndex = Math.floor(Math.random() * player.board.length);
          targets.push(player.board[randomIndex]);
        }
        break;
      }

      case 'random_enemy': {
        const opponentIndex = sourcePlayerIndex === 0 ? 1 : 0;
        const opponent = state.players[opponentIndex];
        if (opponent.board.length > 0) {
          const randomIndex = Math.floor(Math.random() * opponent.board.length);
          targets.push(opponent.board[randomIndex]);
        }
        break;
      }

      case 'face': {
        const opponentIndex = sourcePlayerIndex === 0 ? 1 : 0;
        targets.push(state.players[opponentIndex]);
        break;
      }

      default:
        console.warn(`Unimplemented target type: ${effect.target.type}`);
    }

    // Apply filters (profession, cost, etc.)
    return this.applyFilters(targets, effect.target);
  }

  /**
   * Apply target filters
   */
  private static applyFilters(
    targets: (BoardCard | PlayerState)[],
    selector: any
  ): (BoardCard | PlayerState)[] {
    let filtered = targets;

    // Filter by profession
    if (selector.profession) {
      filtered = filtered.filter(
        (t) => 'profession' in t && t.profession === selector.profession
      );
    }

    // Filter by cost
    if (selector.costLessThan !== undefined) {
      filtered = filtered.filter(
        (t) => 'cost' in t && t.cost < selector.costLessThan
      );
    }

    if (selector.costGreaterThan !== undefined) {
      filtered = filtered.filter(
        (t) => 'cost' in t && t.cost > selector.costGreaterThan
      );
    }

    return filtered;
  }

  /**
   * Destroy a card (move to graveyard)
   */
  private static destroyCard(state: GameState, card: BoardCard): void {
    const player = state.players[card.playerIndex];

    // Move to graveyard
    player.graveyard.push(card);

    // Remove from board
    player.board = player.board.filter((c) => c.instanceId !== card.instanceId);

    // Remove from lane
    const lane = state.lanes[card.laneIndex];
    if (lane.cards[card.playerIndex]?.instanceId === card.instanceId) {
      lane.cards[card.playerIndex] = null;
    }

    // TODO: Trigger deathrattle
  }
}
