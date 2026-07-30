/**
 * Game Store - Zustand state management for game state
 *
 * This is the central reactive state store for the entire game.
 * All game state updates flow through this store.
 */

import { create } from 'zustand';
import type { GameState, PlayerState, Lane, Card, BoardCard, GameAction } from '../types';

interface GameStore extends GameState {
  // Actions
  initGame: (player1Name: string, player2Name: string, deck1: Card[], deck2: Card[]) => void;
  playCard: (playerId: string, cardId: string, laneIndex?: number) => void;
  endTurn: () => void;
  resetGame: () => void;

  // Internal utilities
  getPlayerById: (playerId: string) => PlayerState | null;
  getPlayerByIndex: (index: 0 | 1) => PlayerState;
  getCurrentPlayer: () => PlayerState;
  getOpponent: () => PlayerState;
}

/**
 * Create initial player state
 */
function createInitialPlayer(
  id: string,
  name: string,
  deck: Card[]
): PlayerState {
  return {
    id,
    name,
    avatar: 'default',
    health: 30,
    maxHealth: 30,
    maxMana: 0,
    currentMana: 0,
    deck: [...deck], // Shallow copy
    hand: [],
    board: [],
    graveyard: [],
    cardsPlayedThisTurn: 0,
    damageDealtThisTurn: 0,
  };
}

/**
 * Create initial game state
 */
function createInitialGameState(): GameState {
  const emptyPlayer: PlayerState = {
    id: '',
    name: '',
    avatar: '',
    health: 30,
    maxHealth: 30,
    maxMana: 0,
    currentMana: 0,
    deck: [],
    hand: [],
    board: [],
    graveyard: [],
    cardsPlayedThisTurn: 0,
    damageDealtThisTurn: 0,
  };

  const emptyLanes: [Lane, Lane, Lane, Lane] = [
    { index: 0, cards: [null, null] },
    { index: 1, cards: [null, null] },
    { index: 2, cards: [null, null] },
    { index: 3, cards: [null, null] },
  ];

  return {
    players: [emptyPlayer, emptyPlayer],
    currentPlayer: 0,
    turn: 1,
    phase: 'mulligan',
    lanes: emptyLanes,
    winner: null,
    gameOver: false,
    history: [],
  };
}

/**
 * Zustand Game Store
 */
export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialGameState(),

  /**
   * Initialize a new game
   */
  initGame: (player1Name: string, player2Name: string, deck1: Card[], deck2: Card[]) => {
    const player1 = createInitialPlayer('player1', player1Name, deck1);
    const player2 = createInitialPlayer('player2', player2Name, deck2);

    // Shuffle decks
    shuffleArray(player1.deck);
    shuffleArray(player2.deck);

    // Draw opening hands (3 for player 1, 4 for player 2 - going second advantage)
    for (let i = 0; i < 3; i++) {
      const card = player1.deck.pop();
      if (card) player1.hand.push(card);
    }
    for (let i = 0; i < 4; i++) {
      const card = player2.deck.pop();
      if (card) player2.hand.push(card);
    }

    set({
      players: [player1, player2],
      currentPlayer: 0,
      turn: 1,
      phase: 'main', // Skip mulligan for now
      lanes: [
        { index: 0, cards: [null, null] },
        { index: 1, cards: [null, null] },
        { index: 2, cards: [null, null] },
        { index: 3, cards: [null, null] },
      ],
      winner: null,
      gameOver: false,
      history: [],
    });
  },

  /**
   * Play a card from hand
   */
  playCard: (playerId: string, cardId: string, laneIndex?: number) => {
    const state = get();
    const player = state.getPlayerById(playerId);

    if (!player) {
      console.error('Player not found');
      return;
    }

    // Find card in hand
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      console.error('Card not in hand');
      return;
    }

    const card = player.hand[cardIndex];

    // Check mana
    if (player.currentMana < card.cost) {
      console.error('Not enough mana');
      return;
    }

    // Handle by card type
    if (card.type === 'employee') {
      if (laneIndex === undefined) {
        console.error('Must specify lane for employee cards');
        return;
      }

      const lane = state.lanes[laneIndex];
      if (!lane) {
        console.error('Invalid lane index');
        return;
      }

      const playerIndex = state.currentPlayer;
      if (lane.cards[playerIndex] !== null) {
        console.error('Lane already occupied');
        return;
      }

      // Create board card instance
      const boardCard: BoardCard = {
        ...card,
        instanceId: `${cardId}-${Date.now()}`,
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
        playerIndex,
      };

      // Update state
      set((state) => {
        const newLanes = [...state.lanes] as [Lane, Lane, Lane, Lane];
        newLanes[laneIndex] = {
          ...newLanes[laneIndex],
          cards: [...newLanes[laneIndex].cards] as [BoardCard | null, BoardCard | null],
        };
        newLanes[laneIndex].cards[playerIndex] = boardCard;

        const newPlayers = [...state.players] as [PlayerState, PlayerState];
        const newPlayer = { ...newPlayers[playerIndex] };

        // Remove from hand
        newPlayer.hand = newPlayer.hand.filter((_, i) => i !== cardIndex);

        // Spend mana
        newPlayer.currentMana -= card.cost;

        // Add to board
        newPlayer.board = [...newPlayer.board, boardCard];

        // Increment cards played
        newPlayer.cardsPlayedThisTurn += 1;

        newPlayers[playerIndex] = newPlayer;

        return {
          lanes: newLanes,
          players: newPlayers,
        };
      });
    } else if (card.type === 'tool') {
      // Tool cards: one-time effect, then discarded
      set((state) => {
        const newPlayers = [...state.players] as [PlayerState, PlayerState];
        const newPlayer = { ...newPlayers[playerIndex] };

        // Remove from hand
        newPlayer.hand = newPlayer.hand.filter((_, i) => i !== cardIndex);

        // Spend mana
        newPlayer.currentMana -= card.cost;

        // Move to discard
        newPlayer.graveyard.push(card);

        // Apply tool effect if it exists
        if (card.effect) {
          // TODO: Call EffectsEngine.resolve(state, card.effect)
          // For now, just log
          console.log(`Applied tool effect: ${card.name}`);
        }

        newPlayers[playerIndex] = newPlayer;

        return { players: newPlayers };
      });
    } else if (card.type === 'incident') {
      // Incident cards: immediate event effect, then discarded
      set((state) => {
        const newPlayers = [...state.players] as [PlayerState, PlayerState];
        const newPlayer = { ...newPlayers[playerIndex] };

        // Remove from hand
        newPlayer.hand = newPlayer.hand.filter((_, i) => i !== cardIndex);

        // Spend mana
        newPlayer.currentMana -= card.cost;

        // Move to discard
        newPlayer.graveyard.push(card);

        // Trigger incident effect if it exists
        if (card.effect) {
          // TODO: Call EffectsEngine.resolve(state, card.effect)
          console.log(`Triggered incident: ${card.name}`);
        }

        newPlayers[playerIndex] = newPlayer;

        return { players: newPlayers };
      });
    } else if (card.type === 'upgrade') {
      // Upgrade cards: attach to target employee (requires target selection)
      // Store in pendingUpgrade state for target selection
      set((state) => ({
        pendingUpgrade: {
          card,
          cardIndex,
          playerIndex,
        },
      }));
    } else if (card.type === 'executive') {
      // Executive cards: play as employee with special executive flag
      const boardCard: BoardCard = {
        ...card,
        instanceId: `${card.id}_${Date.now()}_${Math.random()}`,
        currentHealth: card.health,
        currentAttack: card.attack,
        canAttack: false,
        hasAttacked: false,
        hasTaunt: card.keywords.includes('taunt'),
        hasDivineShield: card.keywords.includes('divine_shield'),
        isImmune: card.keywords.includes('immune'),
        isFrozen: false,
        isSilenced: false,
        buffs: [],
        laneIndex,
        playerIndex,
        isExecutive: true, // Mark as executive
      };

      set((state) => {
        const newLanes = [...state.lanes] as [Lane, Lane, Lane, Lane];
        newLanes[laneIndex] = {
          ...newLanes[laneIndex],
          cards: [...newLanes[laneIndex].cards] as [BoardCard | null, BoardCard | null],
        };
        newLanes[laneIndex].cards[playerIndex] = boardCard;

        const newPlayers = [...state.players] as [PlayerState, PlayerState];
        const newPlayer = { ...newPlayers[playerIndex] };

        // Remove from hand
        newPlayer.hand = newPlayer.hand.filter((_, i) => i !== cardIndex);

        // Spend mana
        newPlayer.currentMana -= card.cost;

        // Add to board
        newPlayer.board = [...newPlayer.board, boardCard];

        // Increment cards played
        newPlayer.cardsPlayedThisTurn += 1;

        newPlayers[playerIndex] = newPlayer;

        return {
          lanes: newLanes,
          players: newPlayers,
        };
      });
    }
  },

  /**
   * End current player's turn
   */
  endTurn: () => {
    set((state) => {
      // Will be implemented fully in TurnSystem
      const nextPlayer = state.currentPlayer === 0 ? 1 : 0;
      const newTurn = nextPlayer === 0 ? state.turn + 1 : state.turn;

      return {
        currentPlayer: nextPlayer,
        turn: newTurn,
      };
    });
  },

  /**
   * Reset game to initial state
   */
  resetGame: () => {
    set(createInitialGameState());
  },

  /**
   * Get player by ID
   */
  getPlayerById: (playerId: string) => {
    const state = get();
    return state.players.find(p => p.id === playerId) || null;
  },

  /**
   * Get player by index
   */
  getPlayerByIndex: (index: 0 | 1) => {
    const state = get();
    return state.players[index];
  },

  /**
   * Get current player
   */
  getCurrentPlayer: () => {
    const state = get();
    return state.players[state.currentPlayer];
  },

  /**
   * Get opponent of current player
   */
  getOpponent: () => {
    const state = get();
    const opponentIndex = state.currentPlayer === 0 ? 1 : 0;
    return state.players[opponentIndex];
  },
}));

/**
 * Shuffle array in place (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
