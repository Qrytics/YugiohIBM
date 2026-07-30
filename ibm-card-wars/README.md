# IBM Card Wars

> A production-quality collectible card game featuring IBM employee roles, built with Next.js 15, PixiJS, and TypeScript.

## 🎮 Game Overview

IBM Card Wars is a competitive 4-lane auto-battler card game where players build decks from 12 unique IBM professions, each with distinct mechanics. The game features Hearthstone-style mana progression, automatic combat resolution, and real-time multiplayer.

### Core Mechanics

- **4-Lane Auto-Battler**: Place employees in lanes; they fight automatically each turn
- **Mana System**: Gain 1 mana crystal per turn (max 10), Hearthstone-style
- **150-200 Cards**: Neutral cards + profession-specific cards across 12 IBM roles
- **Free-to-Play**: All gameplay content free; cosmetics-only monetization

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000/games/IBM-card-wars
```

## 🏗️ Implementation Status

### ✅ Phase 0: Foundation (COMPLETE)
- [x] Next.js 15 + TypeScript + Tailwind CSS
- [x] PixiJS WebGL renderer (60 FPS verified)
- [x] IBM-themed dark mode with glassmorphism
- [x] Complete folder structure
- [x] Core TypeScript type definitions

**View the canvas test at:** `http://localhost:3000/games/IBM-card-wars`

### 🔜 Next Steps: Phase 1 - Core Game Engine
- Game state management
- Mana system & turn flow
- 4-lane combat resolution
- Card effects & abilities

## 📦 Tech Stack

- **Next.js 15** (App Router)
- **PixiJS** (WebGL 60 FPS rendering)
- **Tailwind CSS** (IBM-inspired theme)
- **TypeScript** (Full type safety)
- **Zustand** (State management)
- **Framer Motion** (UI animations)

## 📁 Key Files

```
app/games/IBM-card-wars/page.tsx  # Main game page
components/game/GameCanvas.tsx    # PixiJS canvas (60 FPS test)
lib/game-engine/types.ts          # Core type definitions
app/globals.css                   # IBM-themed Tailwind config
```

## 🎨 Design

- **Dark Mode Only** with IBM colors (blue, cyan, purple)
- **Glassmorphism** UI effects
- **60 FPS** animations via WebGL
- **Mobile-friendly** responsive design

---

**Built by Mario Belmonte** • [Portfolio](https://www.mario-belmonte.com)
