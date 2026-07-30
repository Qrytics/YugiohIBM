'use client';

import type { Card } from '@/lib/game-engine/types';

interface ManaCurveProps {
  deck: Card[];
}

export function ManaCurve({ deck }: ManaCurveProps) {
  // Count cards at each mana cost
  const costCounts = new Map<number, number>();
  for (let i = 0; i <= 10; i++) {
    costCounts.set(i, 0);
  }

  deck.forEach((card) => {
    const cost = Math.min(card.cost, 10); // Group 10+ as "10"
    costCounts.set(cost, (costCounts.get(cost) || 0) + 1);
  });

  // Find max count for scaling
  const maxCount = Math.max(...Array.from(costCounts.values()), 1);

  return (
    <div className="glass rounded-lg p-4">
      <h3 className="font-bold text-ibm-cyan mb-3">Mana Curve</h3>

      <div className="flex items-end justify-between gap-1 h-32">
        {Array.from({ length: 11 }, (_, i) => i).map((cost) => {
          const count = costCounts.get(cost) || 0;
          const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={cost} className="flex-1 flex flex-col items-center gap-1">
              {/* Bar */}
              <div className="w-full flex flex-col justify-end flex-1">
                {count > 0 && (
                  <div
                    className={`
                      w-full rounded-t transition-all
                      ${count > 0 ? 'bg-gradient-to-t from-ibm-blue to-ibm-cyan' : 'bg-foreground/10'}
                    `}
                    style={{ height: `${heightPercent}%` }}
                  />
                )}
              </div>

              {/* Count */}
              {count > 0 && (
                <div className="text-xs font-bold text-ibm-cyan">
                  {count}
                </div>
              )}

              {/* Cost Label */}
              <div className="text-[10px] text-foreground/70">
                {cost === 10 ? '10+' : cost}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 text-xs text-foreground/60 text-center">
        Distribution of cards by mana cost
      </div>
    </div>
  );
}
