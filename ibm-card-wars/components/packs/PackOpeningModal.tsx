'use client';

import { Card } from '@/lib/cards/types';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { soundManager } from '@/lib/audio/SoundManager';

interface PackOpeningModalProps {
  cards: Card[];
  newCards: string[];
  onClose: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'border-gray-400 bg-gray-100',
  rare: 'border-blue-500 bg-blue-100',
  epic: 'border-purple-500 bg-purple-100',
  legendary: 'border-yellow-500 bg-yellow-100',
};

const RARITY_GLOW: Record<string, string> = {
  common: 'shadow-gray-300',
  rare: 'shadow-blue-400',
  epic: 'shadow-purple-500',
  legendary: 'shadow-yellow-400',
};

export default function PackOpeningModal({
  cards,
  newCards,
  onClose,
}: PackOpeningModalProps) {
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasLegendary = cards.some((card) => card.rarity === 'legendary');

  useEffect(() => {
    // Play pack open sound
    soundManager.play('pack-open');

    if (revealedIndex < cards.length - 1) {
      const timer = setTimeout(() => {
        const nextIndex = revealedIndex + 1;
        setRevealedIndex(nextIndex);

        // Play card reveal sound
        soundManager.play('draw', 0.3);

        // Trigger confetti for legendary cards
        if (cards[nextIndex].rarity === 'legendary') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [revealedIndex, cards]);

  const isNewCard = (cardId: string) => newCards.includes(cardId);

  const cardVariants = {
    hidden: {
      rotateY: 180,
      opacity: 0,
      scale: 0.5,
    },
    visible: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const glowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <motion.h2
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-bold text-gray-800"
            >
              Pack Opening ✨
            </motion.h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {cards.map((card, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate={index <= revealedIndex ? 'visible' : 'hidden'}
                  style={{ perspective: 1000 }}
                >
                  <motion.div
                    className={`relative rounded-lg border-2 ${
                      RARITY_COLORS[card.rarity] || RARITY_COLORS.common
                    } p-4 shadow-2xl ${RARITY_GLOW[card.rarity] || ''}`}
                    whileHover={{ scale: 1.05, rotateY: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {/* Legendary glow effect */}
                    {card.rarity === 'legendary' && index <= revealedIndex && (
                      <motion.div
                        variants={glowVariants}
                        initial="hidden"
                        animate="visible"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 opacity-50 blur-xl"
                      />
                    )}

                    {isNewCard(card.id) && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 font-bold text-xs px-2 py-1 rounded-full shadow-lg z-10"
                      >
                        NEW!
                      </motion.div>
                    )}

                    <div className="relative z-10 text-center">
                      <h3 className="font-bold text-sm mb-1">{card.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{card.profession}</p>
                      <div className="space-y-1 text-xs">
                        {card.attack !== undefined && <div>⚔️ {card.attack}</div>}
                        {card.defense !== undefined && <div>🛡️ {card.defense}</div>}
                        {card.health !== undefined && <div>❤️ {card.health}</div>}
                      </div>
                      <p
                        className={`text-xs mt-2 font-bold ${
                          card.rarity === 'legendary'
                            ? 'text-yellow-600'
                            : card.rarity === 'epic'
                            ? 'text-purple-600'
                            : card.rarity === 'rare'
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {card.rarity.toUpperCase()}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {revealedIndex === cards.length - 1 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center"
            >
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Continue
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
