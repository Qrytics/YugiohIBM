'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/lib/cards/types';

interface CardHoverPreviewProps {
  card: Card | null;
  position: { x: number; y: number };
}

const RARITY_COLORS: Record<string, string> = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-500 to-purple-700',
  legendary: 'from-yellow-400 to-yellow-600',
};

export default function CardHoverPreview({ card, position }: CardHoverPreviewProps) {
  if (!card) return null;

  const gradient = RARITY_COLORS[card.rarity] || RARITY_COLORS.common;

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50 pointer-events-none"
          style={{
            left: position.x + 20,
            top: position.y + 20,
            maxWidth: '320px',
          }}
        >
          <div
            className={`bg-gradient-to-br ${gradient} rounded-xl p-6 shadow-2xl border-4 border-white`}
          >
            <div className="bg-white bg-opacity-95 rounded-lg p-4">
              {/* Card Header */}
              <div className="mb-3">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{card.name}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">{card.profession}</span>
                  <span
                    className={`font-bold ${
                      card.rarity === 'legendary'
                        ? 'text-yellow-600'
                        : card.rarity === 'epic'
                        ? 'text-purple-600'
                        : card.rarity === 'rare'
                        ? 'text-blue-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {card.rarity.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Stats */}
              {card.type === 'employee' && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-orange-100 rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Attack</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {card.attack}
                    </div>
                  </div>
                  <div className="bg-blue-100 rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Defense</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {card.defense}
                    </div>
                  </div>
                  <div className="bg-red-100 rounded p-2 text-center">
                    <div className="text-xs text-gray-600">Health</div>
                    <div className="text-2xl font-bold text-red-600">{card.health}</div>
                  </div>
                </div>
              )}

              {/* Mana Cost */}
              <div className="mb-3">
                <div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
                  <span className="text-sm text-gray-600">Cost:</span>
                  <span className="text-lg font-bold text-blue-600">{card.cost}</span>
                  <span className="text-sm text-blue-600">💎</span>
                </div>
              </div>

              {/* Keywords */}
              {card.keywords && card.keywords.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Keywords:</div>
                  <div className="flex flex-wrap gap-1">
                    {card.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded capitalize"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-3">
                <div className="text-sm text-gray-700 leading-relaxed">
                  {card.description}
                </div>
              </div>

              {/* Flavor Text */}
              {card.flavorText && (
                <div className="border-t border-gray-300 pt-2">
                  <div className="text-xs italic text-gray-500">
                    "{card.flavorText}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
