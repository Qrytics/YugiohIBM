/**
 * Combat Resolver - 4-Lane Auto-Battler Combat System
 *
 * Combat Resolution Rules:
 * - Each lane resolves independently
 * - If both players have a unit: they fight (simultaneous damage)
 * - If only one player has a unit: attacks opponent's face
 * - If lane is empty: nothing happens
 * - Damage is simultaneous (both units can die)
 * - Deathrattles trigger after all combat damage
 */

import type { GameState, Lane, BoardCard, CombatEvent, PlayerState } from '../types';

export class CombatResolver {
  /**
   * Resolve combat phase for all lanes
   */
  static resolveCombatPhase(state: GameState): CombatEvent[] {
    const events: CombatEvent[] = [];

    // Resolve each lane independently
    for (const lane of state.lanes) {
      const laneEvents = this.resolveLaneCombat(state, lane);
      events.push(...laneEvents);
    }

    // Apply all events
    this.applyEvents(state, events);

    // Clean up dead units
    this.cleanupDeadUnits(state);

    return events;
  }

  /**
   * Resolve combat in a single lane
   */
  private static resolveLaneCombat(state: GameState, lane: Lane): CombatEvent[] {
    const [card0, card1] = lane.cards;
    const events: CombatEvent[] = [];

    // Case 1: Both players have units - they fight
    if (card0 && card1) {
      // Check for frozen units (can't attack)
      const card0CanAttack = !card0.isFrozen && !card0.summoningSickness;
      const card1CanAttack = !card1.isFrozen && !card1.summoningSickness;

      if (card0CanAttack && card1CanAttack) {
        // Both attack - simultaneous damage
        events.push(...this.fightUnits(state, card0, card1));
      } else if (card0CanAttack && !card1CanAttack) {
        // Only card0 attacks (card1 is frozen/sick)
        events.push(...this.attackUnit(state, card0, card1));
      } else if (!card0CanAttack && card1CanAttack) {
        // Only card1 attacks (card0 is frozen/sick)
        events.push(...this.attackUnit(state, card1, card0));
      }
      // Both frozen/sick: no combat
    }
    // Case 2: Only player 0 has a unit - attacks face
    else if (card0 && !card1) {
      if (!card0.isFrozen && !card0.summoningSickness) {
        events.push(this.attackPlayer(state, card0, state.players[1]));
      }
    }
    // Case 3: Only player 1 has a unit - attacks face
    else if (!card0 && card1) {
      if (!card1.isFrozen && !card1.summoningSickness) {
        events.push(this.attackPlayer(state, card1, state.players[0]));
      }
    }
    // Case 4: Lane is empty - nothing happens

    return events;
  }

  /**
   * Two units fight each other (simultaneous damage)
   */
  private static fightUnits(
    state: GameState,
    attacker: BoardCard,
    defender: BoardCard
  ): CombatEvent[] {
    const events: CombatEvent[] = [];

    // Attacker attacks defender
    const attackDamage = attacker.currentAttack;
    events.push({
      type: 'attack',
      sourceId: attacker.instanceId,
      targetId: defender.instanceId,
      amount: attackDamage,
    });

    // Apply damage to defender
    const defenderDamage = this.applyDamage(defender, attackDamage);
    events.push({
      type: 'damage',
      sourceId: attacker.instanceId,
      targetId: defender.instanceId,
      amount: defenderDamage,
    });

    // Defender attacks back (simultaneous)
    const counterDamage = defender.currentAttack;
    events.push({
      type: 'attack',
      sourceId: defender.instanceId,
      targetId: attacker.instanceId,
      amount: counterDamage,
    });

    // Apply damage to attacker
    const attackerDamage = this.applyDamage(attacker, counterDamage);
    events.push({
      type: 'damage',
      sourceId: defender.instanceId,
      targetId: attacker.instanceId,
      amount: attackerDamage,
    });

    // Check for deaths
    if (attacker.currentHealth <= 0) {
      events.push({
        type: 'death',
        cardId: attacker.instanceId,
      });
    }

    if (defender.currentHealth <= 0) {
      events.push({
        type: 'death',
        cardId: defender.instanceId,
      });
    }

    // Mark as attacked
    attacker.hasAttacked = true;
    defender.hasAttacked = true;

    return events;
  }

  /**
   * One unit attacks another (one-way damage)
   */
  private static attackUnit(
    state: GameState,
    attacker: BoardCard,
    defender: BoardCard
  ): CombatEvent[] {
    const events: CombatEvent[] = [];

    const attackDamage = attacker.currentAttack;

    events.push({
      type: 'attack',
      sourceId: attacker.instanceId,
      targetId: defender.instanceId,
      amount: attackDamage,
    });

    const actualDamage = this.applyDamage(defender, attackDamage);
    events.push({
      type: 'damage',
      sourceId: attacker.instanceId,
      targetId: defender.instanceId,
      amount: actualDamage,
    });

    if (defender.currentHealth <= 0) {
      events.push({
        type: 'death',
        cardId: defender.instanceId,
      });
    }

    attacker.hasAttacked = true;

    return events;
  }

  /**
   * Unit attacks player face
   */
  private static attackPlayer(
    state: GameState,
    attacker: BoardCard,
    defender: PlayerState
  ): CombatEvent {
    const damage = attacker.currentAttack;

    // Apply damage to player
    defender.health = Math.max(0, defender.health - damage);

    // Lifesteal: heal attacker's owner
    if (attacker.keywords.includes('lifesteal')) {
      const ownerIndex = attacker.playerIndex;
      const owner = state.players[ownerIndex];
      owner.health = Math.min(owner.maxHealth, owner.health + damage);
    }

    attacker.hasAttacked = true;

    return {
      type: 'damage',
      sourceId: attacker.instanceId,
      targetId: defender.id,
      amount: damage,
    };
  }

  /**
   * Apply damage to a card (handles Divine Shield, etc.)
   */
  private static applyDamage(card: BoardCard, damage: number): number {
    // Divine Shield: block first damage
    if (card.hasDivineShield) {
      card.hasDivineShield = false;
      return 0; // No damage taken
    }

    // Immune: cannot be damaged
    if (card.isImmune) {
      return 0;
    }

    // Apply damage
    card.currentHealth -= damage;

    // Poison: destroy any unit damaged
    // (Handled by poison keyword on attacker - instant death)

    return damage;
  }

  /**
   * Apply all combat events to game state
   */
  private static applyEvents(state: GameState, events: CombatEvent[]): void {
    for (const event of events) {
      // Events are already applied during resolution
      // This could be used for additional effects or animations
    }

    // Check for game over
    if (state.players[0].health <= 0) {
      state.winner = 1;
      state.gameOver = true;
    } else if (state.players[1].health <= 0) {
      state.winner = 0;
      state.gameOver = true;
    }
  }

  /**
   * Remove dead units from board and lanes
   */
  private static cleanupDeadUnits(state: GameState): void {
    // Remove dead cards from lanes
    for (const lane of state.lanes) {
      for (let i = 0; i < 2; i++) {
        const card = lane.cards[i];
        if (card && card.currentHealth <= 0) {
          // Move to graveyard
          const owner = state.players[card.playerIndex];
          owner.graveyard.push(card);

          // Remove from lane
          lane.cards[i] = null;

          // Trigger deathrattle (TODO: implement in EffectsEngine)
        }
      }
    }

    // Remove dead cards from player boards
    for (const player of state.players) {
      player.board = player.board.filter((card) => card.currentHealth > 0);
    }
  }

  /**
   * Reset all units' attack state at start of turn
   */
  static resetAttackState(state: GameState): void {
    for (const lane of state.lanes) {
      for (const card of lane.cards) {
        if (card) {
          card.hasAttacked = false;
          card.summoningSickness = false; // Remove summoning sickness
        }
      }
    }
  }
}
