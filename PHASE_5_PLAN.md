# Phase 5: Multiplayer - Implementation Plan

## Status: **READY TO IMPLEMENT** 🎯

This document outlines the complete plan for implementing real-time multiplayer in IBM Card Wars.

---

## 🎯 Architecture Overview

### Two-Server Architecture

**1. Next.js Frontend + API Server** (Current - Port 3000)
- Serves web UI
- REST API for decks, collection, profile
- NextAuth authentication
- Static assets

**2. NestJS Game Server** (New - Port 3001)
- WebSocket server (Socket.IO)
- Authoritative game state
- Matchmaking queue
- Game logic execution
- Redis for state storage

### Why Separate Servers?

- **Next.js**: Optimized for SSR/SSG, not long-lived WebSocket connections
- **NestJS**: Built for real-time, microservices, WebSockets
- **Scalability**: Game server can be horizontally scaled independently
- **Security**: Game logic isolated from frontend

---

## 📦 Phase 5 Deliverables

### Backend (NestJS Server)

1. **Project Setup**
   - Initialize NestJS project
   - Install Socket.IO, Redis, Prisma
   - Configure TypeScript, ESLint
   - Set up environment variables

2. **Game Gateway** (`src/game/game.gateway.ts`)
   - Socket.IO WebSocket handler
   - Events: `queue:join`, `game:action`, `game:reconnect`
   - Emits: `match:found`, `game:state`, `game:error`, `game:over`
   - Authentication via JWT

3. **Game Service** (`src/game/game.service.ts`)
   - Authoritative game state management
   - Reuse existing game engine (import from frontend)
   - Validate all actions server-side
   - Store state in Redis
   - Broadcast updates to both players

4. **Matchmaking Service** (`src/game/matchmaking.service.ts`)
   - Queue management (in-memory or Redis)
   - ELO-based pairing (±50 MMR, expanding over time)
   - Create match records in database
   - Notify players when matched

5. **Redis Service** (`src/redis/redis.service.ts`)
   - Redis client wrapper
   - Store active game states
   - 5-minute TTL for reconnection
   - Cache matchmaking queue

### Frontend (Next.js Enhancements)

1. **Socket Manager** (`lib/multiplayer/SocketManager.ts`)
   - Socket.IO client wrapper
   - Auto-reconnect logic
   - JWT authentication on connect
   - Event handlers for game updates
   - Error handling & logging

2. **Multiplayer Game Page** (`app/games/IBM-card-wars/multiplayer/page.tsx`)
   - Queue interface (finding match...)
   - Reuse existing `<GameBoard>` component
   - Actions go through Socket.IO instead of local store
   - Display opponent info
   - Disconnect/forfeit handling

3. **Matchmaking UI** (`components/multiplayer/MatchmakingQueue.tsx`)
   - "Find Match" button
   - Queue status (searching, found, connecting...)
   - Estimated wait time
   - Cancel button
   - Rank/MMR display

4. **Game State Sync**
   - Listen for `game:state` events
   - Update Zustand store from server broadcasts
   - Optimistic UI updates with rollback on error
   - Show "Waiting for opponent..." during their turn

---

## 🔄 Multiplayer Flow

### 1. Matchmaking

```
Client A                     Game Server                   Client B
   |                              |                            |
   |--queue:join----------------->|                            |
   |      (JWT, MMR)              |                            |
   |                              |<--queue:join---------------|
   |                              |     (JWT, MMR)             |
   |                              |                            |
   |                         [Find Match]                      |
   |                       (MMR: 1000 ± 50)                    |
   |                              |                            |
   |<--match:found----------------|----match:found------------>|
   |   (matchId, opponentInfo)    |   (matchId, opponentInfo) |
```

### 2. Game Start

```
Server:
1. Create game state (shuffle decks, mulligan, etc.)
2. Store in Redis with matchId as key
3. Emit initial state to both players
4. Set current player to player 0
```

### 3. Game Loop

```
Client (Current Player)          Server                  Client (Opponent)
   |                              |                            |
   |--game:action---------------->|                            |
   |  (type: play_card)           |                            |
   |  (cardId, laneIndex)         |                            |
   |                              |                            |
   |                         [Validate]                        |
   |                       (has card? enough mana?)            |
   |                              |                            |
   |                         [Execute]                         |
   |                    (update game state)                    |
   |                              |                            |
   |<--game:state-----------------|----game:state------------->|
   |   (updated state)            |    (updated state)         |
   |                              |                            |
   |--game:action---------------->|                            |
   |  (type: end_turn)            |                            |
   |                              |                            |
   |                       [Resolve Combat]                    |
   |                       [Switch Player]                     |
   |                              |                            |
   |<--game:state-----------------|----game:state------------->|
   |   (combat events, new turn)  |   (now your turn!)         |
```

### 4. Game End

```
Server:
1. Detect winner (health ≤ 0)
2. Update game state (gameOver: true, winner: X)
3. Emit game:over to both players
4. Save match to database (Match model)
5. Update player profiles (wins, losses, XP, MMR)
6. Delete state from Redis
```

### 5. Reconnection

```
Client                           Server
   |                              |
   |--game:reconnect------------->|
   |  (matchId, JWT)              |
   |                              |
   |                       [Find in Redis]                     
   |                       (5min TTL)                          
   |                              |
   |<--game:state-----------------|
   |   (current state)            |
   |                              |
   [Resume from current position] |
```

---

## 🛠️ Implementation Steps

### Step 1: Setup NestJS Server (1-2 days)

```bash
# In project root
npm install -g @nestjs/cli
nest new ibm-card-wars-server

cd ibm-card-wars-server
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @nestjs/microservices redis @prisma/client
npm install --save-dev @types/node
```

**File structure:**
```
ibm-card-wars-server/
├── src/
│   ├── game/
│   │   ├── game.gateway.ts          # WebSocket handler
│   │   ├── game.service.ts          # Game logic
│   │   ├── matchmaking.service.ts   # Queue & pairing
│   │   └── game.module.ts
│   ├── redis/
│   │   ├── redis.service.ts
│   │   └── redis.module.ts
│   ├── auth/
│   │   ├── jwt.strategy.ts          # Validate JWT
│   │   └── auth.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma                # Copy from frontend
└── package.json
```

### Step 2: Implement Game Gateway (2-3 days)

**Key Events:**

```typescript
// Client → Server
@SubscribeMessage('queue:join')
handleJoinQueue(client: Socket, data: { deckId: string })

@SubscribeMessage('game:action')
handleGameAction(client: Socket, data: GameAction)

@SubscribeMessage('game:reconnect')
handleReconnect(client: Socket, data: { matchId: string })

// Server → Client
socket.emit('match:found', { matchId, opponent, deckVsEnemyDeck })
socket.emit('game:state', { state: GameState })
socket.emit('game:error', { error: string })
socket.emit('game:over', { winner, stats })
```

### Step 3: Authoritative Game Service (3-4 days)

**Core Logic:**

```typescript
class GameService {
  // Reuse frontend game engine
  async initGame(matchId: string, player1: Player, player2: Player): Promise<GameState>
  
  async executeAction(matchId: string, playerId: string, action: GameAction): Promise<GameState>
  
  async getGameState(matchId: string): Promise<GameState | null>
  
  async endGame(matchId: string, winnerId: string): Promise<void>
}
```

**Validation:**
- Is it this player's turn?
- Does player have this card in hand?
- Does player have enough mana?
- Is target valid?

**State Storage:**
```typescript
redis.setex(matchId, 300, JSON.stringify(gameState)) // 5min TTL
```

### Step 4: Matchmaking (1-2 days)

**Queue Structure:**
```typescript
interface QueueEntry {
  userId: string;
  socketId: string;
  mmr: number;
  deckId: string;
  joinedAt: number;
}
```

**Pairing Algorithm:**
```typescript
// Find opponent with similar MMR
const initialRange = 50;
const maxRange = 200;
const range = Math.min(
  initialRange + (timeSinceJoin / 1000) * 10,
  maxRange
);

const opponent = queue.find(entry =>
  Math.abs(entry.mmr - player.mmr) <= range
);
```

### Step 5: Frontend Socket Manager (1 day)

```typescript
// lib/multiplayer/SocketManager.ts
class SocketManager {
  private socket: Socket;
  
  connect(token: string) {
    this.socket = io('http://localhost:3001', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });
  }
  
  joinQueue(deckId: string) {
    this.socket.emit('queue:join', { deckId });
  }
  
  sendAction(action: GameAction) {
    this.socket.emit('game:action', action);
  }
  
  onMatchFound(callback: (match) => void) {
    this.socket.on('match:found', callback);
  }
  
  onGameState(callback: (state) => void) {
    this.socket.on('game:state', callback);
  }
}
```

### Step 6: Multiplayer UI (2-3 days)

**Queue Page:**
- Show player's rank, MMR
- "Find Match" button
- Searching animation
- Estimated wait time
- Cancel button

**In-Game:**
- Reuse `<GameBoard>` component
- Actions call `socketManager.sendAction()` instead of `store.playCard()`
- Show opponent's profile picture, name, rank
- "Waiting for opponent..." overlay during their turn
- Disconnect timer (30 seconds → auto-forfeit)

---

## 🔒 Security Considerations

1. **JWT Verification**: Validate JWT on WebSocket connect
2. **Action Validation**: Server validates every action
3. **Rate Limiting**: Max 10 actions per second per player
4. **Cheat Prevention**: Server is source of truth (client never calculates)
5. **Reconnection Auth**: Re-verify JWT on reconnect

---

## 📊 Data Flow

**Game State:**
```typescript
// Server (Redis)
{
  matchId: string;
  players: [Player, Player];
  currentPlayer: 0 | 1;
  turn: number;
  phase: GamePhase;
  lanes: Lane[];
  winner: number | null;
  gameOver: boolean;
  history: GameEvent[];
}
```

**Server sends ONLY:**
- Current player's hand (visible)
- Opponent's hand count (hidden)
- Board state (visible to both)
- Player health, mana, deck count
- History of actions

**Client can see:**
- Own cards
- Opponent's card count
- Board state
- Game phase

**Client CANNOT see:**
- Opponent's hand
- Opponent's deck order
- Future draws

---

## 🧪 Testing Plan

### Unit Tests
- Game service action validation
- Matchmaking pairing logic
- Redis storage/retrieval
- JWT verification

### Integration Tests
- Full game flow (join → match → play → end)
- Reconnection scenarios
- Concurrent matches (100+ simultaneous)
- Error handling (disconnect, timeout, invalid action)

### Load Testing
- 1000 concurrent connections
- 100 active matches
- Measure latency (< 100ms target)

---

## 🚀 Deployment

### Development
```bash
# Terminal 1: Frontend
cd ibm-card-wars
npm run dev

# Terminal 2: Game Server
cd ibm-card-wars-server
npm run start:dev

# Terminal 3: Redis
docker run -p 6379:6379 redis:alpine
```

### Production
- **Frontend**: Vercel (serverless)
- **Game Server**: Railway/Fly.io (persistent WebSocket)
- **Redis**: Upstash (managed Redis)
- **Database**: Supabase (PostgreSQL)

---

## 📈 Estimated Timeline

- Setup NestJS: 1-2 days
- Game Gateway: 2-3 days
- Game Service: 3-4 days
- Matchmaking: 1-2 days
- Frontend Socket Manager: 1 day
- Multiplayer UI: 2-3 days
- Testing & Polish: 2-3 days

**Total: 12-18 days (2-3 weeks)**

---

## 🎯 Success Criteria

- [ ] Two players can find each other in matchmaking
- [ ] Match starts with shuffled decks and mulligan
- [ ] Players can play cards in turns
- [ ] Combat resolves automatically
- [ ] Game detects winner correctly
- [ ] Match saved to database
- [ ] Profile stats updated (wins, XP, MMR)
- [ ] Reconnection works within 5 minutes
- [ ] Latency < 100ms for actions
- [ ] 100+ concurrent matches supported

---

## 🔮 Future Enhancements (Phase 6+)

- Spectator mode
- Replay system (event sourcing)
- Tournament brackets
- Ranked seasons
- Leaderboards
- Friend challenges
- Emotes & chat
- Mobile app (React Native)

---

**Ready to implement real-time multiplayer!** 🎮
