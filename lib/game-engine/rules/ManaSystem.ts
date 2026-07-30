/**
 * Mana System - Hearthstone-style mana crystals
 *
 * Rules:
 * - Start at 1 mana, gain +1 per turn (max 10)
 * - Mana refills to max at start of each turn
 * - Spend mana to play cards
 */

import type { PlayerState } from '../types';

export class ManaSystem {
  /**
   * Maximum mana crystals a player can have
   */
  static readonly MAX_MANA = 10;

  /**
   * Start of turn: Gain mana crystal and refill
   */
  static startTurn(player: PlayerState, turnNumber: number): void {
    // Gain one mana crystal per turn (max 10)
    player.maxMana = Math.min(this.MAX_MANA, turnNumber);

    // Refill mana to maximum
    player.currentMana = player.maxMana;
  }

  /**
   * Check if player can afford a card
   */
  static canAfford(player: PlayerState, cost: number): boolean {
    return player.currentMana >= cost;
  }

  /**
   * Spend mana to play a card
   */
  static spend(player: PlayerState, cost: number): void {
    if (!this.canAfford(player, cost)) {
      throw new Error(`Insufficient mana: have ${player.currentMana}, need ${cost}`);
    }

    player.currentMana -= cost;
  }

  /**
   * Gain temporary mana (for card effects)
   */
  static gainTemporary(player: PlayerState, amount: number): void {
    player.currentMana = Math.min(this.MAX_MANA, player.currentMana + amount);
  }

  /**
   * Calculate mana for a given turn number
   */
  static getManaForTurn(turnNumber: number): number {
    return Math.min(this.MAX_MANA, turnNumber);
  }

  /**
   * Get mana crystal display info
   */
  static getManaDisplay(player: PlayerState): {
    current: number;
    max: number;
    available: number;
    spent: number;
  } {
    return {
      current: player.currentMana,
      max: player.maxMana,
      available: player.currentMana,
      spent: player.maxMana - player.currentMana,
    };
  }
}
