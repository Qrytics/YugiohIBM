import { GameCanvas } from '@/components/game/GameCanvas';
import Link from 'next/link';

export default function IBMCardWarsPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-7xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-ibm-blue via-ibm-cyan to-ibm-purple bg-clip-text text-transparent">
              IBM Card Wars
            </span>
          </h1>
          <p className="text-foreground/70 text-lg">
            Production-Quality Collectible Card Game
          </p>
          <div className="mt-4 flex gap-4 justify-center">
            <span className="glass px-4 py-2 rounded-full text-sm">
              4-Lane Auto-Battler
            </span>
            <span className="glass px-4 py-2 rounded-full text-sm">
              150+ Cards
            </span>
            <span className="glass px-4 py-2 rounded-full text-sm">
              12 Professions
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/games/IBM-card-wars/play"
              className="inline-block glass-strong px-12 py-6 rounded-xl font-bold text-2xl text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-all duration-300 border-2 border-ibm-cyan hover:scale-105 shadow-lg shadow-ibm-cyan/30"
            >
              Play Now
            </Link>
            <Link
              href="/games/IBM-card-wars/deck-builder"
              className="inline-block glass-strong px-12 py-6 rounded-xl font-bold text-2xl text-ibm-purple hover:bg-ibm-purple hover:text-background transition-all duration-300 border-2 border-ibm-purple hover:scale-105 shadow-lg shadow-ibm-purple/30"
            >
              Deck Builder
            </Link>
          </div>
        </div>

        {/* Canvas Test */}
        <div className="glass-strong rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-ibm-cyan">
            Phase 0: Foundation Test
          </h2>
          <p className="text-foreground/70 mb-6">
            Testing PixiJS WebGL renderer at 60 FPS with IBM-themed animations
          </p>

          <GameCanvas width={1280} height={720} className="mx-auto" />

          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div className="glass p-4 rounded-lg">
              <div className="text-ibm-blue font-bold mb-1">Renderer</div>
              <div className="text-foreground/70">WebGL (GPU Accelerated)</div>
            </div>
            <div className="glass p-4 rounded-lg">
              <div className="text-ibm-cyan font-bold mb-1">Target</div>
              <div className="text-foreground/70">60 FPS</div>
            </div>
            <div className="glass p-4 rounded-lg">
              <div className="text-ibm-purple font-bold mb-1">Status</div>
              <div className="text-success-green">✓ Operational</div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="glass rounded-xl p-8">
          <h3 className="text-xl font-bold mb-4 text-ibm-blue">
            Implementation Progress
          </h3>
          <div className="space-y-3">
            <StatusItem
              status="completed"
              title="Phase 0: Foundation & Architecture"
              description="Next.js 15, TypeScript, Tailwind, PixiJS, Folder Structure"
            />
            <StatusItem
              status="completed"
              title="Phase 1: Core Game Engine (Offline)"
              description="Game State, Mana System, 4-Lane Combat, Turn System - PLAYABLE!"
            />
            <StatusItem
              status="completed"
              title="Phase 2: Card System & Content"
              description="172 cards, 12 professions with unique mechanics - COMPLETE!"
            />
            <StatusItem
              status="completed"
              title="Phase 3: Deck Building & Collection"
              description="Deck builder, filters, validation, mana curve - COMPLETE!"
            />
            <StatusItem
              status="pending"
              title="Phase 4+: Backend, Multiplayer, Polish"
              description="Database, authentication, real-time multiplayer, progression"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-foreground/50 text-sm">
          <p>
            Built with Next.js 15, PixiJS, Framer Motion, and Zustand
          </p>
          <p className="mt-2">
            Designed for production deployment on Vercel
          </p>
        </div>
      </div>
    </main>
  );
}

interface StatusItemProps {
  status: 'completed' | 'in_progress' | 'pending';
  title: string;
  description: string;
}

function StatusItem({ status, title, description }: StatusItemProps) {
  const statusConfig = {
    completed: {
      icon: '✓',
      color: 'text-success-green',
      bg: 'bg-success-green/10',
    },
    in_progress: {
      icon: '◐',
      color: 'text-warning-yellow',
      bg: 'bg-warning-yellow/10',
    },
    pending: {
      icon: '○',
      color: 'text-foreground/30',
      bg: 'bg-foreground/5',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-foreground/5 transition-colors">
      <div
        className={`${config.bg} ${config.color} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold`}
      >
        {config.icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-foreground mb-1">{title}</div>
        <div className="text-sm text-foreground/60">{description}</div>
      </div>
    </div>
  );
}
