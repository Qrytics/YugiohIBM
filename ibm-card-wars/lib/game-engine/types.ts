/**
 * IBM Card Wars - Core Game Engine Types
 * Production-quality type definitions for the card game
 */

// ============================================================================
// CARD TYPES
// ============================================================================

export type Profession =
  | 'cloud'
  | 'ai'
  | 'security'
  | 'data'
  | 'software'
  | 'devops'
  | 'ux'
  | 'pm'
  | 'business'
  | 'sales'
  | 'mainframe'
  | 'sre'
  | 'neutral';

export type CardType = 'employee' | 'tool' | 'incident' | 'executive' | 'upgrade';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type Keyword =
  | 'rush' // Can attack immediately (no summoning sickness)
  | 'taunt' // Must be attacked first
  | 'stealth' // Can't be targeted until attacks
  | 'divine_shield' // Immune to first damage instance
  | 'windfury' // Attacks twice
  | 'lifesteal' // Heal player for damage dealt
  | 'poison' // Destroy any unit damaged
  | 'freeze' // Target can't attack next turn
  | 'overload' // Cost mana next turn
  | 'combo' // Bonus if card played this turn
  | 'discover' // Choose one of three
  | 'adapt' // Random buff
  | 'immune'; // Can't be damaged

// ============================================================================
// EFFECT SYSTEM
// ============================================================================

export type EffectType =
  | 'damage'
  | 'heal'
  | 'draw'
  | 'summon'
  | 'buff'
  | 'debuff'
  | 'transform'
  | 'destroy'
  | 'silence'
  | 'freeze'
  | 'return_to_hand'
  | 'add_to_deck';

export type TargetType =
  | 'all_friendly'
  | 'all_enemy'
  | 'all_units'
  | 'random_friendly'
  | 'random_enemy'
  | 'random_unit'
  | 'choose_friendly'
  | 'choose_enemy'
  | 'all_in_lane'
  | 'adjacent'
  | 'face'; // Player health

export interface TargetSelector {
  type: TargetType;
  profession?: Profession;
  costLessThan?: number;
  costGreaterThan?: number;
  count?: number;
  laneIndex?: number;
  chooser?: 'caster' | 'opponent';
}

export interface Effect {
  type: EffectType;
  target?: TargetSelector;
  amount?: number;
  cardId?: string; // For summon effects
  value?: string | number; // Generic value for various effects
}

export type TriggerType =
  | 'start_of_turn'
  | 'end_of_turn'
  | 'on_play'
  | 'on_death'
  | 'on_damage_taken'
  | 'on_damage_dealt'
  | 'on_card_played'
  | 'on_unit_summoned'
  | 'on_attack';

export interface Trigger {
  on: TriggerType;
  effect: Effect;
  condition?: {
    cardType?: CardType;
    profession?: Profession;
  };
}

// ============================================================================
// CARD DEFINITIONS
// ============================================================================

export interface Card {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  rarity: Rarity;
  profession: Profession;

  // Employee stats (only for employee cards)
  attack?: number;
  health?: number;

  // Abilities
  battlecry?: Effect; // On play
  deathrattle?: Effect; // On death
  ongoing?: Effect; // Continuous effect while on board
  trigger?: Trigger; // Event-based triggers

  // Flavor
  description: string;
  flavorText: string;
  artUrl: string;

  // Keywords
  keywords: Keyword[];
}

// Card on the board (with current state)
export interface BoardCard extends Card {
  instanceId: string; // Unique instance ID for this specific card on board
  currentHealth: number;
  currentAttack: number;
  statusEffects: StatusEffect[];
  summoningSickness: boolean; // Can't attack on turn played (unless Rush)
  hasAttacked: boolean; // Attacked this turn
  hasTaunt: boolean;
  hasStealth: boolean;
  hasDivineShield: boolean;
  isImmune: boolean;
  isFrozen: boolean;
  isSilenced: boolean; // Loses all abilities
  buffs: Buff[];
  laneIndex: number; // Which lane this card is in
  playerIndex: 0 | 1; // Which player owns this card
}

export interface StatusEffect {
  type: 'frozen' | 'poisoned' | 'silenced' | 'immune';
  duration?: number; // Turns remaining, undefined = permanent
}

export interface Buff {
  attack: number;
  health: number;
  source: string; // Card instance ID that granted this buff
  duration?: number; // Turns remaining, undefined = permanent
}

// ============================================================================
// GAME STATE
// ============================================================================

export type GamePhase = 'mulligan' | 'draw' | 'main' | 'combat' | 'end';

export interface Lane {
  index: 0 | 1 | 2 | 3;
  cards: [BoardCard | null, BoardCard | null]; // [player 0, player 1]
}

export interface PlayerState {
  id: string;
  name: string;
  avatar: string;

  // Health
  health: number;
  maxHealth: number;

  // Mana (Hearthstone-style)
  maxMana: number; // Max mana crystals
  currentMana: number; // Available mana this turn

  // Card zones
  deck: Card[];
  hand: Card[];
  board: BoardCard[]; // All cards this player has on board
  graveyard: Card[];

  // Stats
  cardsPlayedThisTurn: number;
  damageDealtThisTurn: number;
}

export interface GameState {
  // Players
  players: [PlayerState, PlayerState];
  currentPlayer: 0 | 1; // Index of current player

  // Turn info
  turn: number; // Turn counter (increments every full round)
  phase: GamePhase;

  // Board
  lanes: [Lane, Lane, Lane, Lane]; // 4 shared lanes

  // Game status
  winner: 0 | 1 | null; // null = game ongoing
  gameOver: boolean;

  // History (for replays/spectating)
  history: GameEvent[];
}

// ============================================================================
// GAME EVENTS
// ============================================================================

export type GameEventType =
  | 'game_start'
  | 'turn_start'
  | 'turn_end'
  | 'phase_change'
  | 'card_drawn'
  | 'card_played'
  | 'card_summoned' // Summoned by effect, not played from hand
  | 'card_attacked'
  | 'card_damaged'
  | 'card_healed'
  | 'card_died'
  | 'card_buffed'
  | 'card_debuffed'
  | 'effect_triggered'
  | 'mana_gained'
  | 'mana_spent'
  | 'player_damaged'
  | 'player_healed'
  | 'game_over';

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  playerId?: string;
  cardId?: string;
  targetId?: string;
  amount?: number;
  data?: unknown; // Additional event-specific data
}

// ============================================================================
// ACTIONS
// ============================================================================

export type GameActionType =
  | 'play_card'
  | 'attack'
  | 'use_ability'
  | 'end_turn'
  | 'mulligan'
  | 'concede';

export interface GameAction {
  type: GameActionType;
  playerId: string;
  cardId?: string;
  targetId?: string;
  laneIndex?: number;
  cardIds?: string[]; // For mulligan
}

export interface ActionResult {
  success: boolean;
  error?: string;
  events?: GameEvent[];
}

// ============================================================================
// COMBAT
// ============================================================================

export interface CombatEvent {
  type: 'damage' | 'death' | 'attack' | 'heal';
  sourceId?: string;
  targetId?: string;
  amount?: number;
  cardId?: string;
}

// ============================================================================
// DECK
// ============================================================================

export interface Deck {
  id: string;
  name: string;
  cards: string[]; // Array of card IDs
  createdAt: number;
  updatedAt: number;
}

export interface DeckValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// MULTIPLAYER
// ============================================================================

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  deck1: string[]; // Card IDs
  deck2: string[]; // Card IDs
  winnerId: string | null;
  mode: 'ranked' | 'casual' | 'story';
  duration?: number; // Seconds
  createdAt: number;
}

export interface QueueEntry {
  userId: string;
  deckId: string;
  mmr: number;
  joinedAt: number;
}

// ============================================================================
// USER PROGRESSION
// ============================================================================

export interface Profile {
  userId: string;
  level: number;
  xp: number;
  rank: Rank;
  mmr: number;
  wins: number;
  losses: number;

  // Cosmetics
  cardBack: string;
  avatar: string;
  title: string | null;
}

export type Rank =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster';

export interface Mission {
  id: string;
  type: 'daily' | 'weekly';
  description: string;
  progress: number;
  goal: number;
  reward: {
    xp?: number;
    packs?: number;
  };
  expiresAt: number;
}
