# Phase 6: Progression & Rewards - Progress Report

**Started:** July 30, 2026  
**Status:** Foundation Complete, API & UI Pending  
**Next Session:** Continue implementation

---

## ✅ What's Complete (Session 1)

### 1. Database Schema
**File:** `prisma/schema.prisma`

Added two new models:
- ✅ **Pack Model** - Tracks unopened/opened packs
  - Fields: `id`, `userId`, `type` (standard/rare/epic), `source`, `createdAt`, `openedAt`
  - Indexed on `userId`
- ✅ **Mission Model** - Tracks daily/weekly missions
  - Fields: `id`, `userId`, `type`, `missionId`, `progress`, `goal`, `completed`, `claimed`, `expiresAt`
  - Indexed on `userId` and `expiresAt`
- ✅ **Migration Created:** `20260730184135_add_packs_and_missions`
- ✅ **Database Updated:** Migration applied successfully

### 2. Progression Utilities
**Location:** `ibm-card-wars/lib/progression/`

Created 4 core utility files:

#### `levelSystem.ts` (✅ Complete)
- `getXPForLevel(level)` - Get total XP needed for level
- `getLevelFromXP(xp)` - Calculate current level from XP
- `getProgressToNextLevel(xp)` - Get progress info (%, XP needed, etc.)
- `checkLevelUp(oldXP, newXP)` - Detect level gains
- **Formula:** Level * 100 XP per level (Level 2 needs 100 XP, Level 3 needs 200 XP, etc.)
- **Max Level:** 50

#### `rankSystem.ts` (✅ Complete)
- `getRankFromMMR(mmr)` - Get rank from MMR value
- `getRankInfo(rank)` - Get rank details (name, color, icon, thresholds)
- `getNextRankThreshold(mmr)` - MMR needed for next rank
- `getProgressToNextRank(mmr)` - Progress toward next rank
- `checkRankChange(oldMMR, newMMR)` - Detect promotions/demotions
- **Ranks:** Bronze (0-999), Silver (1000-1499), Gold (1500-1999), Platinum (2000-2499), Diamond (2500-2999), Master (3000-3499), Grandmaster (3500+)

#### `levelRewards.ts` (✅ Complete)
- `LEVEL_REWARDS` - Reward table for levels 2-50
- `getRewardsForLevel(level)` - Get rewards for specific level
- `hasRewards(level)` - Check if level has rewards
- `getNextRewardLevel(level)` - Find next reward level
- **Rewards:** Packs awarded at most levels (standard at early levels, rare/epic at higher levels)

#### `packSystem.ts` (✅ Complete)
- `generatePackContents(packType)` - Generate random cards based on rarity rates
- `getPackInfo(packType)` - Get pack display info (name, color, description)
- `identifyNewCards(cards, ownedIds)` - Check which cards are new
- **Pack Sizes:** Standard (5), Rare (7), Epic (10)
- **Rarity Rates:**
  - Standard: 70% common, 20% rare, 8% epic, 2% legendary (guaranteed 1 rare+)
  - Rare: 50% common, 30% rare, 15% epic, 5% legendary
  - Epic: 30% common, 40% rare, 20% epic, 10% legendary

#### `missionDefinitions.ts` (✅ Complete)
- `DAILY_MISSIONS` - 7 daily mission templates
- `WEEKLY_MISSIONS` - 4 weekly mission templates
- `generateDailyMissions()` - Pick 3 random daily missions
- `generateWeeklyMissions()` - Pick 1 random weekly mission
- `getMissionExpiryTime(type)` - Calculate expiry (midnight UTC for daily, Monday for weekly)
- **Mission Types:** Play X games, Win X games, Play with specific profession
- **Rewards:** XP, packs

---

## 🔜 What's Pending (Session 2)

### 3. API Routes (5 files - ~2 hours)

#### Pack APIs
**File:** `ibm-card-wars/app/api/packs/route.ts`
- `GET /api/packs` - Get all unopened packs for user
- Logic: Query Pack model where `userId` and `openedAt IS NULL`

**File:** `ibm-card-wars/app/api/packs/open/route.ts`
- `POST /api/packs/open` with `{ packId: string }`
- Logic:
  1. Verify pack ownership and not opened
  2. Call `generatePackContents(pack.type)` from packSystem
  3. Add cards to CardOwnership (upsert quantities)
  4. Mark pack as opened (`openedAt = now`)
  5. Return cards + identify new cards
  6. Update user profile XP if applicable

#### Mission APIs
**File:** `ibm-card-wars/app/api/missions/route.ts`
- `GET /api/missions` - Get active missions for user
- Logic: Query Mission model where `userId`, `expiresAt > now`, split by type

**File:** `ibm-card-wars/app/api/missions/generate/route.ts`
- `POST /api/missions/generate` - Generate new missions if expired
- Logic:
  1. Check for expired missions
  2. Delete expired missions
  3. Generate 3 daily + 1 weekly from templates
  4. Create Mission records with expiry times
  5. Return new missions

**File:** `ibm-card-wars/app/api/missions/[id]/claim/route.ts`
- `POST /api/missions/[id]/claim` - Claim completed mission rewards
- Logic:
  1. Verify mission completed (progress >= goal)
  2. Verify not already claimed
  3. Award rewards (create Pack records, add XP)
  4. Mark mission as claimed
  5. Return rewards

---

### 4. Game Server Integration (1 file - ~1 hour)

**File:** `ibm-card-wars-server/src/game/game.service.ts`

**Modify `endMatch()` method:**
```typescript
// After updating profiles with XP and MMR:

// CHECK FOR LEVEL UP
import { getLevelFromXP, checkLevelUp } from '../../../ibm-card-wars/lib/progression/levelSystem';
import { getRewardsForLevel } from '../../../ibm-card-wars/lib/progression/levelRewards';
import { getRankFromMMR } from '../../../ibm-card-wars/lib/progression/rankSystem';

const winnerOldLevel = getLevelFromXP(winnerProfile.xp - winnerXP);
const winnerNewLevel = getLevelFromXP(winnerProfile.xp);

if (winnerNewLevel > winnerOldLevel) {
  // Update level
  await this.prisma.profile.update({
    where: { userId: winnerId },
    data: { level: winnerNewLevel }
  });

  // Award level rewards
  for (let level = winnerOldLevel + 1; level <= winnerNewLevel; level++) {
    const rewards = getRewardsForLevel(level);
    for (const reward of rewards) {
      if (reward.type === 'pack') {
        await this.prisma.pack.create({
          data: {
            userId: winnerId,
            type: reward.packType,
            source: `level_${level}`,
          }
        });
      }
    }
  }
}

// Same for loser if they leveled up

// CHECK FOR RANK PROMOTION
const winnerNewRank = getRankFromMMR(winnerProfile.mmr);
if (winnerNewRank !== winnerProfile.rank) {
  await this.prisma.profile.update({
    where: { userId: winnerId },
    data: { rank: winnerNewRank }
  });
}

// Same for loser rank check
```

**Add helper method:**
```typescript
private async updateMissionProgress(userId: string, eventType: 'play' | 'win') {
  // Get active missions for user
  const missions = await this.prisma.mission.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
      completed: false,
    }
  });

  // Update progress for relevant missions
  for (const mission of missions) {
    const template = getMissionTemplate(mission.missionId);
    if (!template) continue;

    let shouldIncrement = false;

    if (eventType === 'play' && template.category === 'play') {
      shouldIncrement = true;
    } else if (eventType === 'win' && template.category === 'win') {
      shouldIncrement = true;
    }

    if (shouldIncrement) {
      const newProgress = mission.progress + 1;
      await this.prisma.mission.update({
        where: { id: mission.id },
        data: {
          progress: newProgress,
          completed: newProgress >= mission.goal,
        }
      });
    }
  }
}
```

**Call in appropriate places:**
- Start of match: `await this.updateMissionProgress(player1Id, 'play')`
- Start of match: `await this.updateMissionProgress(player2Id, 'play')`
- End of match: `await this.updateMissionProgress(winnerId, 'win')`

---

### 5. UI Components (13 files - ~4-5 hours)

**Create directories:**
```bash
mkdir -p ibm-card-wars/components/profile
mkdir -p ibm-card-wars/components/collection
mkdir -p ibm-card-wars/components/packs
mkdir -p ibm-card-wars/components/missions
mkdir -p ibm-card-wars/components/progression
```

#### Profile Components (4 files)
1. `components/profile/ProfileHeader.tsx` - Avatar + level badge
2. `components/profile/StatsCard.tsx` - Wins, losses, win rate, MMR
3. `components/profile/XPBar.tsx` - Animated progress bar
4. `components/profile/RankBadge.tsx` - Rank icon + name with color

#### Collection Components (3 files)
5. `components/collection/CollectionGrid.tsx` - Grid of all cards
6. `components/collection/CardTile.tsx` - Single card with quantity badge
7. `components/collection/CollectionFilters.tsx` - Filter by profession/rarity

#### Pack Components (4 files)
8. `components/packs/PackInventory.tsx` - List of unopened packs
9. `components/packs/PackOpeningModal.tsx` - Full-screen card reveal
10. `components/packs/CardReveal.tsx` - Individual card flip animation
11. `components/packs/NewCardBadge.tsx` - "NEW!" indicator

#### Mission Components (3 files)
12. `components/missions/MissionCard.tsx` - Single mission display
13. `components/missions/MissionProgress.tsx` - Progress bar
14. `components/missions/RewardBadge.tsx` - Pack/XP reward icon

#### Progression Components (1 file)
15. `components/progression/LevelUpModal.tsx` - Level-up celebration modal

**Recommended libraries:**
- `framer-motion` for animations
- `react-confetti` for celebrations
- Use existing Tailwind classes for styling

---

### 6. Pages (4 files - ~2-3 hours)

**Create routes:**
```bash
mkdir -p ibm-card-wars/app/games/IBM-card-wars/profile
mkdir -p ibm-card-wars/app/games/IBM-card-wars/collection
mkdir -p ibm-card-wars/app/games/IBM-card-wars/packs
mkdir -p ibm-card-wars/app/games/IBM-card-wars/missions
```

#### Profile Page
**File:** `app/games/IBM-card-wars/profile/page.tsx`
- Fetch profile data (`GET /api/profile`)
- Display ProfileHeader, StatsCard, XPBar, RankBadge
- Show collection stats (cards owned / total)
- Recent matches (from Match model)

#### Collection Page
**File:** `app/games/IBM-card-wars/collection/page.tsx`
- Fetch collection (`GET /api/collection`)
- Display CollectionGrid with filters
- Show all 172 cards (owned + locked)
- Search functionality

#### Packs Page
**File:** `app/games/IBM-card-wars/packs/page.tsx`
- Fetch packs (`GET /api/packs`)
- Display PackInventory
- On pack click → open PackOpeningModal
- Call `POST /api/packs/open` → show animation
- Update collection

#### Missions Page
**File:** `app/games/IBM-card-wars/missions/page.tsx`
- Fetch missions (`GET /api/missions`)
- Generate if needed (`POST /api/missions/generate`)
- Display daily/weekly tabs
- Show MissionCard with progress
- Claim button when completed
- Timer showing time until reset

---

### 7. Navigation Update (1 file - ~30 mins)

**File:** `components/layout/Navigation.tsx` or equivalent

**Add menu items:**
- Profile (with level badge display)
- Collection (with card count: "150/172")
- Packs (with unopened count badge if > 0)
- Missions (with completed count badge if > 0)

**Example:**
```tsx
<Link href="/games/IBM-card-wars/profile">
  Profile {profile.level && <span className="badge">Lv.{profile.level}</span>}
</Link>
<Link href="/games/IBM-card-wars/packs">
  Packs {unopenedCount > 0 && <span className="badge">{unopenedCount}</span>}
</Link>
```

---

### 8. Testing (~1-2 hours)

**Test Level-Up:**
1. Set profile XP to 50 (via database)
2. Play match and win (+200 XP = 250 total)
3. Should level up to 2 (needs 100 XP) and 3 (needs 200 XP)
4. Check database: `level = 3`, 1-2 packs created
5. Verify level shown in UI

**Test Pack Opening:**
1. Navigate to `/games/IBM-card-wars/packs`
2. See packs from level-up
3. Click pack → animation plays
4. See 5 cards revealed
5. Check database: `openedAt` set, cards added to CardOwnership

**Test Missions:**
1. Navigate to `/games/IBM-card-wars/missions`
2. Generate missions if none exist
3. See 3 daily + 1 weekly
4. Play match → mission progress increments
5. Complete mission → claim rewards

**Test Profile:**
1. Navigate to `/games/IBM-card-wars/profile`
2. See level, rank, MMR, XP bar
3. See win/loss stats
4. Verify XP bar percentage correct

**Test Collection:**
1. Navigate to `/games/IBM-card-wars/collection`
2. See all owned cards with quantities
3. Filter by profession → only see those cards
4. See locked cards (not owned)

---

## 📋 File Checklist

### ✅ Completed (Session 1)
- [x] `prisma/schema.prisma` - Added Pack & Mission models
- [x] Migration: `20260730184135_add_packs_and_missions`
- [x] `lib/progression/levelSystem.ts`
- [x] `lib/progression/rankSystem.ts`
- [x] `lib/progression/levelRewards.ts`
- [x] `lib/progression/packSystem.ts`
- [x] `lib/progression/missionDefinitions.ts`

### ⏳ Pending (Session 2)

**API Routes (5):**
- [ ] `app/api/packs/route.ts` (GET)
- [ ] `app/api/packs/open/route.ts` (POST)
- [ ] `app/api/missions/route.ts` (GET)
- [ ] `app/api/missions/generate/route.ts` (POST)
- [ ] `app/api/missions/[id]/claim/route.ts` (POST)

**Game Server (1):**
- [ ] `ibm-card-wars-server/src/game/game.service.ts` (modify)

**Components (13):**
- [ ] `components/profile/ProfileHeader.tsx`
- [ ] `components/profile/StatsCard.tsx`
- [ ] `components/profile/XPBar.tsx`
- [ ] `components/profile/RankBadge.tsx`
- [ ] `components/collection/CollectionGrid.tsx`
- [ ] `components/collection/CardTile.tsx`
- [ ] `components/collection/CollectionFilters.tsx`
- [ ] `components/packs/PackInventory.tsx`
- [ ] `components/packs/PackOpeningModal.tsx`
- [ ] `components/packs/CardReveal.tsx`
- [ ] `components/packs/NewCardBadge.tsx`
- [ ] `components/missions/MissionCard.tsx`
- [ ] `components/missions/MissionProgress.tsx`
- [ ] `components/missions/RewardBadge.tsx`
- [ ] `components/progression/LevelUpModal.tsx`

**Pages (4):**
- [ ] `app/games/IBM-card-wars/profile/page.tsx`
- [ ] `app/games/IBM-card-wars/collection/page.tsx`
- [ ] `app/games/IBM-card-wars/packs/page.tsx`
- [ ] `app/games/IBM-card-wars/missions/page.tsx`

**Navigation (1):**
- [ ] Update navigation component

**Total:** 7 complete, 24 pending

---

## 🎯 Implementation Priority (Session 2)

### High Priority (Core Flow)
1. **Pack API routes** - Enable pack opening
2. **Profile page** - Show progression stats
3. **Collection page** - View owned cards
4. **Packs page** - Open packs
5. **Game server level-up logic** - Auto-award packs

### Medium Priority (Full Features)
6. **Mission APIs** - Enable quest system
7. **Missions page** - Complete/claim missions
8. **Level-up modal** - Celebration UI
9. **Navigation** - Add new routes

### Lower Priority (Polish)
10. **Advanced animations** - Card reveal effects
11. **Confetti** - Legendary pack celebrations
12. **Mission auto-generation** - Background job

---

## 💡 Implementation Tips

### API Routes
- Follow existing pattern from `app/api/profile/route.ts`
- Use `getServerSession` for auth
- Return typed responses: `NextResponse.json({ data })`
- Handle errors gracefully

### Components
- Use Tailwind for styling (match existing game UI)
- Use `"use client"` for interactive components
- Fetch data at page level, pass as props
- Use React hooks (useState, useEffect) for client state

### Animations
```bash
npm install framer-motion react-confetti
```

- `framer-motion` for card flips, progress bars
- `react-confetti` for level-up celebrations
- Keep animations under 1 second for snappy feel

### Testing
- Test with multiple users to see different levels/MMRs
- Manually adjust database values to test edge cases
- Use browser DevTools to debug API calls
- Check database after each operation

---

## 📖 Reference

**Existing patterns to follow:**
- API auth: `app/api/profile/route.ts`
- Page layout: `app/games/IBM-card-wars/deck-builder/page.tsx`
- Component style: `components/game/GameBoard.tsx`
- Tailwind classes: Existing card/button styles

**Utility usage examples:**
```typescript
import { getLevelFromXP, getProgressToNextLevel } from '@/lib/progression/levelSystem';
import { getRankFromMMR, getRankInfo } from '@/lib/progression/rankSystem';
import { generatePackContents } from '@/lib/progression/packSystem';

const level = getLevelFromXP(1250); // Returns 5
const progress = getProgressToNextLevel(1250);
// { currentLevel: 5, progressXP: 250, requiredXP: 500, percent: 50 }

const rank = getRankFromMMR(1750); // Returns 'gold'
const rankInfo = getRankInfo('gold');
// { name: 'Gold', color: '#FFD700', minMMR: 1500, ... }

const cards = generatePackContents('standard'); // Returns 5 random cards
```

---

## ⚡ Quick Start (Session 2)

1. **Create API routes first** (packs, missions)
2. **Update game server** (level-up logic)
3. **Build profile page** (easiest, shows progression working)
4. **Build packs page** (test pack opening)
5. **Build collection page** (see cards from packs)
6. **Build missions page** (full quest system)
7. **Add navigation** (tie everything together)
8. **Test end-to-end** (play match → level up → open pack → see cards)

---

**Phase 6 foundation is solid! Ready to continue in next session.** 🚀
