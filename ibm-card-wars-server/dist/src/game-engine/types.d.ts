export type Profession = 'cloud' | 'ai' | 'security' | 'data' | 'software' | 'devops' | 'ux' | 'pm' | 'business' | 'sales' | 'mainframe' | 'sre' | 'neutral';
export type CardType = 'employee' | 'tool' | 'incident' | 'executive' | 'upgrade';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type Keyword = 'rush' | 'taunt' | 'stealth' | 'divine_shield' | 'windfury' | 'lifesteal' | 'poison' | 'freeze' | 'overload' | 'combo' | 'discover' | 'adapt' | 'immune';
export type EffectType = 'damage' | 'heal' | 'draw' | 'summon' | 'buff' | 'debuff' | 'transform' | 'destroy' | 'silence' | 'freeze' | 'return_to_hand' | 'add_to_deck' | 'discover' | 'bounce' | 'modify' | 'aura' | 'give_keyword' | 'reveal' | 'generate' | 'refill_unused_mana' | 'cost_reduction' | 'cost_increase' | 'damage_reduction' | 'draw_to_count';
export type TargetType = 'all_friendly' | 'all_enemy' | 'all_units' | 'random_friendly' | 'random_enemy' | 'random_unit' | 'choose_friendly' | 'choose_enemy' | 'all_in_lane' | 'adjacent' | 'face';
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
    type: EffectType | string;
    target?: TargetSelector | string;
    amount?: number;
    cardId?: string;
    value?: string | number;
    [key: string]: any;
}
export type TriggerType = 'start_of_turn' | 'end_of_turn' | 'on_play' | 'on_death' | 'on_damage_taken' | 'on_damage_dealt' | 'on_card_played' | 'on_unit_summoned' | 'on_attack';
export interface Trigger {
    on?: TriggerType;
    event?: string;
    effect: Effect;
    condition?: {
        cardType?: CardType;
        profession?: Profession;
    };
}
export interface Card {
    id: string;
    name: string;
    cost: number;
    type: CardType;
    rarity: Rarity;
    profession: Profession;
    attack?: number;
    health?: number;
    battlecry?: Effect;
    deathrattle?: Effect;
    ongoing?: Effect;
    trigger?: Trigger;
    costModifier?: any;
    description: string;
    flavorText: string;
    artUrl: string;
    keywords: Keyword[];
}
export interface BoardCard extends Card {
    instanceId: string;
    currentHealth: number;
    currentAttack: number;
    statusEffects: StatusEffect[];
    summoningSickness: boolean;
    hasAttacked: boolean;
    hasTaunt: boolean;
    hasStealth: boolean;
    hasDivineShield: boolean;
    isImmune: boolean;
    isFrozen: boolean;
    isSilenced: boolean;
    buffs: Buff[];
    laneIndex: number;
    playerIndex: 0 | 1;
}
export interface StatusEffect {
    type: 'frozen' | 'poisoned' | 'silenced' | 'immune';
    duration?: number;
}
export interface Buff {
    attack: number;
    health: number;
    source: string;
    duration?: number;
}
export type GamePhase = 'mulligan' | 'draw' | 'main' | 'combat' | 'end';
export interface Lane {
    index: 0 | 1 | 2 | 3;
    cards: [BoardCard | null, BoardCard | null];
}
export interface PlayerState {
    id: string;
    name: string;
    avatar: string;
    health: number;
    maxHealth: number;
    maxMana: number;
    currentMana: number;
    deck: Card[];
    hand: Card[];
    board: BoardCard[];
    graveyard: Card[];
    cardsPlayedThisTurn: number;
    damageDealtThisTurn: number;
}
export interface GameState {
    players: [PlayerState, PlayerState];
    currentPlayer: 0 | 1;
    turn: number;
    phase: GamePhase;
    lanes: [Lane, Lane, Lane, Lane];
    winner: 0 | 1 | null;
    gameOver: boolean;
    history: GameEvent[];
}
export type GameEventType = 'game_start' | 'turn_start' | 'turn_end' | 'phase_change' | 'card_drawn' | 'card_played' | 'card_summoned' | 'card_attacked' | 'card_damaged' | 'card_healed' | 'card_died' | 'card_buffed' | 'card_debuffed' | 'effect_triggered' | 'mana_gained' | 'mana_spent' | 'player_damaged' | 'player_healed' | 'game_over';
export interface GameEvent {
    type: GameEventType;
    timestamp: number;
    playerId?: string;
    cardId?: string;
    targetId?: string;
    amount?: number;
    data?: unknown;
}
export type GameActionType = 'play_card' | 'attack' | 'use_ability' | 'end_turn' | 'mulligan' | 'concede';
export interface GameAction {
    type: GameActionType;
    playerId: string;
    cardId?: string;
    targetId?: string;
    laneIndex?: number;
    cardIds?: string[];
}
export interface ActionResult {
    success: boolean;
    error?: string;
    events?: GameEvent[];
}
export interface CombatEvent {
    type: 'damage' | 'death' | 'attack' | 'heal';
    sourceId?: string;
    targetId?: string;
    amount?: number;
    cardId?: string;
}
export interface Deck {
    id: string;
    name: string;
    cards: string[];
    createdAt: number;
    updatedAt: number;
}
export interface DeckValidationResult {
    isValid: boolean;
    errors: string[];
}
export interface Match {
    id: string;
    player1Id: string;
    player2Id: string;
    deck1: string[];
    deck2: string[];
    winnerId: string | null;
    mode: 'ranked' | 'casual' | 'story';
    duration?: number;
    createdAt: number;
}
export interface QueueEntry {
    userId: string;
    deckId: string;
    mmr: number;
    joinedAt: number;
}
export interface Profile {
    userId: string;
    level: number;
    xp: number;
    rank: Rank;
    mmr: number;
    wins: number;
    losses: number;
    cardBack: string;
    avatar: string;
    title: string | null;
}
export type Rank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';
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
