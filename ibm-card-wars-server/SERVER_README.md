# IBM Card Wars - Game Server

**NestJS-based authoritative game server for real-time multiplayer gameplay**

## Architecture

This is a production-quality WebSocket game server built with:
- **NestJS** - TypeScript framework for scalable Node.js applications
- **Socket.IO** - Real-time bidirectional event-based communication
- **Redis** - Game state storage with 5-minute TTL for reconnection
- **Prisma 7** - Type-safe database access with SQLite (dev) / PostgreSQL (prod)
- **JWT Auth** - Token-based authentication compatible with NextAuth

## Features Implemented

✅ **WebSocket Gateway** - Socket.IO event handlers for all game actions  
✅ **Matchmaking Service** - MMR-based pairing with expanding search range  
✅ **Game Service** - Authoritative game logic execution and state management  
✅ **Server Game Engine** - Deterministic game logic with seeded RNG  
✅ **Redis State Storage** - 5-minute TTL for reconnection support  
✅ **JWT Authentication** - Validates NextAuth tokens on connection  
✅ **State Filtering** - Hides opponent hand/deck order from clients  
✅ **ELO System** - MMR calculation for ranked matchmaking  
✅ **XP & Leveling** - Experience gain based on match performance  
✅ **Match Records** - Database persistence of completed matches

## Project Structure

```
src/
├── main.ts                      # Bootstrap with CORS
├── app.module.ts                # Root module
├── auth/
│   ├── jwt.strategy.ts          # JWT validation strategy
│   ├── ws-jwt.guard.ts          # WebSocket authentication guard
│   └── auth.module.ts
├── game/
│   ├── game.gateway.ts          # WebSocket event handlers
│   ├── game.service.ts          # Game orchestration & state management
│   ├── matchmaking.service.ts   # Queue & MMR-based pairing
│   └── game.module.ts
├── redis/
│   ├── redis.service.ts         # Redis client wrapper
│   └── redis.module.ts
├── game-engine/
│   ├── ServerGameEngine.ts      # Authoritative game logic
│   ├── types.ts                 # Type definitions
│   └── rules/                   # Game rules (copied from frontend)
├── cards/                       # Card database (copied from frontend)
├── utils/
│   ├── SeededRNG.ts             # Deterministic random number generator
│   └── prisma.service.ts        # Prisma singleton
└── prisma/
    └── schema.prisma            # Database schema
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update `.env`:

```env
DATABASE_URL="file:../prisma/dev.db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="<same-secret-as-nextauth>"
PORT=3001
```

**IMPORTANT:** The `JWT_SECRET` must match the secret used in the Next.js NextAuth configuration!

### 3. Start Redis

```bash
# Option 1: Docker
docker run -d -p 6379:6379 redis:alpine

# Option 2: Local Redis (Windows)
# Download from: https://redis.io/download
redis-server
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Build the Server

```bash
npm run build
```

### 6. Start the Server

```bash
# Development mode (auto-reload)
npm run start:dev

# Production mode
npm run start:prod
```

Server will start on `http://localhost:3001` with WebSocket support.

## WebSocket Events

### Client → Server

#### `queue:join`
Join matchmaking queue.

**Payload:**
```typescript
{ deckId: string }
```

**Response:** `match:found` when opponent found

---

#### `queue:leave`
Leave matchmaking queue.

**Payload:** None

---

#### `game:action`
Execute a game action (play card, end turn, attack, etc.).

**Payload:**
```typescript
{
  matchId: string,
  action: {
    type: 'play_card' | 'end_turn' | 'attack' | 'concede',
    playerId: string,
    cardId?: string,
    laneIndex?: number,
    targetId?: string
  }
}
```

**Response:** `game:state` (broadcast to both players) or `game:error`

---

#### `game:reconnect`
Reconnect to an active match.

**Payload:**
```typescript
{ matchId: string }
```

**Response:** `game:state` with current state

---

#### `game:forfeit`
Forfeit the match.

**Payload:**
```typescript
{ matchId: string }
```

**Response:** `game:over` (both players)

---

### Server → Client

#### `match:found`
Match created, opponent found.

**Payload:**
```typescript
{
  matchId: string,
  opponent: {
    id: string,
    name: string,
    rank: string,
    mmr: number
  },
  playerSlot: 0 | 1,
  initialState: GameState  // Filtered for this player
}
```

---

#### `game:state`
Updated game state after an action.

**Payload:** `GameState` (filtered - opponent hand hidden)

---

#### `game:error`
Action rejected by server.

**Payload:**
```typescript
{ error: string }
```

Examples:
- "Not your turn"
- "Not enough mana"
- "Card not in hand"

---

#### `game:over`
Match ended.

**Payload:**
```typescript
{
  winner: 0 | 1,
  reason: 'health' | 'disconnect' | 'forfeit',
  duration: number,  // seconds
  xpGained: number,
  mmrChange: number
}
```

---

#### `opponent:disconnected`
Opponent lost connection.

**Payload:** None

---

#### `opponent:reconnected`
Opponent reconnected.

**Payload:** None

---

## Matchmaking Algorithm

1. Player joins queue with MMR (from Profile)
2. Server searches for opponent with similar MMR
3. Initial range: ±50 MMR
4. Range expands by 10 MMR per second
5. Max range: ±200 MMR
6. Best match selected (smallest MMR difference)

**Example:**
```
Player A: MMR 1000, waits 0s → searches 950-1050
Player A: MMR 1000, waits 5s → searches 900-1100
Player A: MMR 1000, waits 15s → searches 800-1200 (capped at ±200)
```

## Game Flow

### 1. Queue & Match
```
Client → queue:join { deckId }
Server → Matchmaking service finds opponent
Server → match:found (to both clients)
```

### 2. Game Start
```
Server → Creates GameState (shuffle, mulligan, deal hands)
Server → Stores in Redis (5min TTL)
Server → Emits initial game:state (filtered per player)
```

### 3. Gameplay Loop
```
Client → game:action { type: 'play_card', ... }
Server → Validates (turn order, mana, card ownership)
Server → Executes via ServerGameEngine
Server → Updates Redis
Server → Broadcasts game:state to both players
```

### 4. Game End
```
Server → Detects winner (health ≤ 0)
Server → Calculates MMR change (ELO system)
Server → Calculates XP gain
Server → Updates Profile (wins/losses, MMR, XP)
Server → Creates Match record
Server → Emits game:over
Server → Deletes from Redis
```

### 5. Reconnection
```
Client → game:reconnect { matchId }
Server → Fetches from Redis
Server → Emits game:state (filtered)
Server → Notifies opponent: opponent:reconnected
```

## State Filtering

The server never sends opponent's hidden information:

**Player sees:**
- ✅ Own hand (full card details)
- ✅ Opponent hand count (not cards)
- ✅ Both players' board state
- ✅ Health, mana, deck count
- ✅ Graveyard (both players)

**Player does NOT see:**
- ❌ Opponent's hand cards
- ❌ Opponent's deck order
- ❌ Future draws

## Security

✅ **JWT Authentication** - Every connection validated  
✅ **Server Authority** - All game logic server-side  
✅ **Action Validation** - Turn order, mana, card ownership  
✅ **State Filtering** - Hidden information never sent  
✅ **Deterministic RNG** - Seeded for replay, prevents manipulation  
✅ **Rate Limiting** - (TODO: 10 actions/sec per player)

## Database Schema

### Profile
- `mmr` - Matchmaking rating (default: 1000)
- `wins` / `losses` - Win/loss record
- `xp` / `level` - Experience and level
- `rank` - Display rank (bronze, silver, gold, etc.)

### Match
- `player1Id` / `player2Id` - Participants
- `deck1Id` / `deck2Id` - Decks used
- `winnerId` - Winner
- `duration` - Match length (seconds)
- `turns` - Total turns
- `replayData` - (Optional) Full event history

## MMR System

Uses ELO-like calculation:

```typescript
K = 32  // K-factor
expectedScore = 1 / (1 + 10^((loserMMR - winnerMMR) / 400))
mmrChange = K * (1 - expectedScore)

winnerMMR += mmrChange
loserMMR -= mmrChange
```

**Example:**
- Winner MMR: 1000, Loser MMR: 1000 → ±16 MMR
- Winner MMR: 1000, Loser MMR: 1200 → Winner +28, Loser -28
- Winner MMR: 1200, Loser MMR: 1000 → Winner +4, Loser -4

## XP System

```typescript
baseXP = 50
winBonus = 100
turnBonus = min(turns * 5, 100)  // Capped at 100

xpGained = baseXP + (isWinner ? winBonus : 0) + turnBonus
```

**Example:**
- Win in 10 turns: 50 + 100 + 50 = 200 XP
- Loss in 10 turns: 50 + 0 + 50 = 100 XP
- Win in 30 turns: 50 + 100 + 100 = 250 XP (cap)

## Troubleshooting

### Server won't start
- ✅ Check Redis is running: `redis-cli ping` (should return PONG)
- ✅ Check port 3001 is free: `netstat -an | grep 3001`
- ✅ Check DATABASE_URL points to existing db file
- ✅ Run `npx prisma generate`

### WebSocket connection fails
- ✅ Check CORS origin matches Next.js URL
- ✅ Verify JWT_SECRET matches Next.js
- ✅ Check client sends valid JWT in `auth.token`

### Match not found on reconnect
- ✅ Redis TTL is 5 minutes - reconnect within window
- ✅ Check Redis has the key: `redis-cli keys "game:*"`

### Actions rejected
- ✅ Check logs for error reason
- ✅ Verify it's player's turn
- ✅ Verify player has enough mana
- ✅ Verify card is in player's hand

## Development

### Run in watch mode
```bash
npm run start:dev
```

### Run tests
```bash
npm run test
```

### Lint
```bash
npm run lint
```

### Format
```bash
npm run format
```

## Production Deployment

### Environment Variables (Production)
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
REDIS_URL="redis://redis-host:6379"
JWT_SECRET="<strong-secret>"
PORT=3001
NODE_ENV=production
```

### Recommended Platforms
- **Game Server:** Railway, Fly.io, DigitalOcean (needs persistent WebSocket)
- **Redis:** Upstash (managed Redis)
- **Database:** Supabase (PostgreSQL)

### Scaling
- Horizontal scaling: Multiple server instances
- Sticky sessions: Route players to same server for duration of match
- Redis cluster: For distributed state storage
- Load balancer: NGINX or Cloudflare

## Next Steps

- [ ] Implement 30-second disconnect timeout with auto-forfeit
- [ ] Add rate limiting (10 actions/sec per player)
- [ ] Implement replay system (store full event history)
- [ ] Add spectator mode
- [ ] Implement friend challenges
- [ ] Add emotes/chat
- [ ] Create admin panel
- [ ] Add match statistics/analytics
- [ ] Implement seasonal rankings

## Support

For issues or questions:
- Check [PHASE_5_PLAN.md](../PHASE_5_PLAN.md) for architecture details
- Review [PHASE_5_COMPLETE.md](../PHASE_5_COMPLETE.md) for what was built
- See client implementation in `ibm-card-wars/lib/multiplayer/`

---

**Phase 5 Server Complete! 🎮**
